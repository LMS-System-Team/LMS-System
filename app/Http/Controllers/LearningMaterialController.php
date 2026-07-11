<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearningMaterial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class LearningMaterialController extends Controller
{
    private const MAX_UPLOAD_KB = 512000;

    private const EXTENSIONS = [
        'video' => ['mp4', 'm4v', 'mov', 'webm', 'ogg'],
        'pdf' => ['pdf'],
        'audiobook' => ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac'],
    ];

    private const MIME_PREFIXES = [
        'video' => ['video/'],
        'pdf' => ['application/pdf'],
        'audiobook' => ['audio/'],
    ];

    /**
     * Display the uploaded learning materials list.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $type = $request->string('type', 'all')->toString();
        $status = $request->string('status', 'all')->toString();
        $categoryId = $request->integer('category');

        return Inertia::render('learning-materials/index', [
            'materials' => LearningMaterial::query()
                ->with('category')
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhere('original_name', 'like', "%{$search}%");
                    });
                })
                ->when(in_array($type, LearningMaterial::TYPES, true), function ($query) use ($type) {
                    $query->where('type', $type);
                })
                ->when(in_array($status, LearningMaterial::STATUSES, true), function ($query) use ($status) {
                    $query->where('status', $status);
                })
                ->when($categoryId > 0, function ($query) use ($categoryId) {
                    $query->where('category_id', $categoryId);
                })
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (LearningMaterial $material): array => $this->materialPayload($material)),
            'categories' => $this->categoryOptions(),
            'filters' => [
                'search' => $search,
                'type' => in_array($type, LearningMaterial::TYPES, true) ? $type : 'all',
                'status' => in_array($status, LearningMaterial::STATUSES, true) ? $status : 'all',
                'category' => $categoryId > 0 ? $categoryId : null,
            ],
            'types' => LearningMaterial::TYPES,
        ]);
    }

    /**
     * Show the upload form.
     */
    public function create(): Response
    {
        return Inertia::render('learning-materials/create', [
            'categories' => $this->categoryOptions(),
            'types' => LearningMaterial::TYPES,
            'maxUploadMegabytes' => (int) floor(self::MAX_UPLOAD_KB / 1024),
        ]);
    }

    /**
     * Show a material detail page.
     */
    public function show(LearningMaterial $learningMaterial): Response
    {
        return Inertia::render('learning-materials/show', [
            'material' => $this->materialPayload($learningMaterial->load('category')),
        ]);
    }

    /**
     * Show the edit form.
     */
    public function edit(LearningMaterial $learningMaterial): Response
    {
        return Inertia::render('learning-materials/edit', [
            'material' => $this->materialPayload($learningMaterial->load('category')),
            'categories' => $this->categoryOptions($learningMaterial->category),
            'types' => LearningMaterial::TYPES,
            'maxUploadMegabytes' => (int) floor(self::MAX_UPLOAD_KB / 1024),
        ]);
    }

    /**
     * Store a newly uploaded material.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $file = $request->file('material');

        if (! $file instanceof UploadedFile || ! $file->isValid()) {
            throw ValidationException::withMessages([
                'material' => __('Choose a valid video, PDF, or audiobook file.'),
            ]);
        }

        $this->validateMaterialFile($file, $validated['type']);

        $category = $this->findCategory((int) $validated['category_id']);
        $disk = (string) config('lms.media_disk', 'public');
        $storedFile = $this->storeMaterialFile($file, $category, $validated['type'], $disk);

        LearningMaterial::query()->create([
            'category_id' => $category->id,
            'title' => $validated['title'],
            'slug' => $this->uniqueSlug($validated['title'], $category),
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'disk' => $disk,
            ...$storedFile,
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Learning material uploaded.')]);

        return to_route('learning-materials.index');
    }

    /**
     * Update material details and optionally replace the stored file.
     */
    public function update(Request $request, LearningMaterial $learningMaterial): RedirectResponse
    {
        $validated = $request->validate($this->rules(updating: true));
        $file = $request->file('material');
        $hasReplacementFile = $file instanceof UploadedFile && $file->isValid();

        if ($validated['type'] !== $learningMaterial->type && ! $hasReplacementFile) {
            throw ValidationException::withMessages([
                'material' => __('Upload a replacement file when changing the material type.'),
            ]);
        }

        if ($file instanceof UploadedFile && ! $file->isValid()) {
            throw ValidationException::withMessages([
                'material' => __('Choose a valid video, PDF, or audiobook file.'),
            ]);
        }

        $category = $this->findCategory((int) $validated['category_id']);
        $attributes = [
            'category_id' => $category->id,
            'title' => $validated['title'],
            'slug' => $this->uniqueSlug($validated['title'], $category, $learningMaterial),
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published'
                ? ($learningMaterial->published_at ?? now())
                : null,
        ];

        if ($hasReplacementFile) {
            $this->validateMaterialFile($file, $validated['type']);

            $oldDisk = $learningMaterial->disk;
            $oldPath = $learningMaterial->path;
            $disk = (string) config('lms.media_disk', 'public');

            $attributes = [
                ...$attributes,
                'disk' => $disk,
                ...$this->storeMaterialFile($file, $category, $validated['type'], $disk),
            ];

            $learningMaterial->fill($attributes)->save();
            Storage::disk($oldDisk)->delete($oldPath);
        } else {
            $learningMaterial->update($attributes);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Learning material updated.')]);

        return to_route('learning-materials.index');
    }

    /**
     * Redirect to a readable URL for the uploaded file.
     */
    public function preview(LearningMaterial $learningMaterial): RedirectResponse
    {
        $url = $this->materialUrl($learningMaterial);

        if (Str::startsWith($url, ['http://', 'https://'])) {
            return redirect()->away($url);
        }

        return redirect($url);
    }

    /**
     * Delete a material and its stored file.
     */
    public function destroy(LearningMaterial $learningMaterial): RedirectResponse
    {
        Storage::disk($learningMaterial->disk)->delete($learningMaterial->path);
        $learningMaterial->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Learning material deleted.')]);

        return to_route('learning-materials.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(bool $updating = false): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists(Category::class, 'id')],
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
            'type' => ['required', Rule::in(LearningMaterial::TYPES)],
            'status' => ['required', Rule::in(LearningMaterial::STATUSES)],
            'material' => [$updating ? 'nullable' : 'required', 'file', 'max:'.self::MAX_UPLOAD_KB],
        ];
    }

    private function validateMaterialFile(UploadedFile $file, string $type): void
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: '');
        $mimeType = (string) ($file->getMimeType() ?: $file->getClientMimeType());

        $extensionAllowed = in_array($extension, self::EXTENSIONS[$type], true);
        $mimeAllowed = collect(self::MIME_PREFIXES[$type])->contains(function (string $allowed) use ($mimeType) {
            return str_ends_with($allowed, '/') ? str_starts_with($mimeType, $allowed) : $mimeType === $allowed;
        });

        if (! $extensionAllowed && ! $mimeAllowed) {
            throw ValidationException::withMessages([
                'material' => __('Choose a file that matches the selected material type.'),
            ]);
        }
    }

    private function findCategory(int $id): Category
    {
        return Category::query()
            ->whereKey($id)
            ->firstOrFail();
    }

    /**
     * @return array{path: string, original_name: string, mime_type: string|null, extension: string, size_bytes: int}
     */
    private function storeMaterialFile(UploadedFile $file, Category $category, string $type, string $disk): array
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: '');

        if (! in_array($extension, self::EXTENSIONS[$type], true)) {
            $extension = $file->guessExtension() ?: $type;
        }

        $directory = "learning-materials/{$category->slug}/{$type}";
        $path = $file->storeAs($directory, Str::uuid().'.'.$extension, $disk);

        if ($path === false) {
            throw ValidationException::withMessages([
                'material' => __('The material could not be uploaded. Please try again.'),
            ]);
        }

        return [
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
            'extension' => $extension,
            'size_bytes' => $file->getSize() ?: 0,
        ];
    }

    private function uniqueSlug(string $title, Category $category, ?LearningMaterial $ignore = null): string
    {
        $baseSlug = Str::slug($title) ?: 'material';
        $slug = $baseSlug;
        $counter = 2;

        while (
            LearningMaterial::query()
                ->where('category_id', $category->id)
                ->where('slug', $slug)
                ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->getKey()))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function materialUrl(LearningMaterial $material): string
    {
        $disk = Storage::disk($material->disk);

        if ($material->disk === 'public') {
            return $disk->url($material->path);
        }

        try {
            return $disk->temporaryUrl($material->path, now()->addMinutes(30));
        } catch (RuntimeException) {
            return $disk->url($material->path);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function categoryOptions(?Category $selected = null): array
    {
        return Category::query()
            ->where(function ($query) use ($selected) {
                $query->where('status', 'active');

                if ($selected) {
                    $query->orWhere('id', $selected->id);
                }
            })
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function materialPayload(LearningMaterial $material): array
    {
        return [
            'id' => $material->id,
            'title' => $material->title,
            'description' => $material->description,
            'type' => $material->type,
            'status' => $material->status,
            'disk' => $material->disk,
            'path' => $material->path,
            'original_name' => $material->original_name,
            'mime_type' => $material->mime_type,
            'extension' => $material->extension,
            'size_bytes' => $material->size_bytes,
            'size_formatted' => Number::fileSize($material->size_bytes),
            'preview_url' => route('learning-materials.preview', $material, absolute: false),
            'category' => [
                'id' => $material->category?->id,
                'name' => $material->category?->name,
                'slug' => $material->category?->slug,
            ],
            'created_at' => $material->created_at?->toISOString(),
            'created_at_formatted' => $material->created_at?->format('M j, Y'),
            'updated_at_formatted' => $material->updated_at?->format('M j, Y'),
            'published_at_formatted' => $material->published_at?->format('M j, Y'),
        ];
    }
}
