<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display the categories list.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $status = $request->string('status', 'all')->toString();

        return Inertia::render('categories/index', [
            'categories' => Category::query()
                ->withCount('learningMaterials')
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                })
                ->when(in_array($status, ['active', 'inactive'], true), function ($query) use ($status) {
                    $query->where('status', $status);
                })
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (Category $category): array => $this->categoryPayload($category)),
            'filters' => [
                'search' => $search,
                'status' => in_array($status, ['active', 'inactive'], true) ? $status : 'all',
            ],
        ]);
    }

    /**
     * Show the form for creating a category.
     */
    public function create(): Response
    {
        return Inertia::render('categories/create');
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        Category::query()->create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return to_route('categories.index');
    }

    /**
     * Show the form for editing a category.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('categories/edit', [
            'category' => $this->categoryPayload($category->loadCount('learningMaterials')),
        ]);
    }

    /**
     * Update a category.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $category->fill([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        if ($category->isDirty('name')) {
            $category->slug = $this->uniqueSlug($validated['name'], $category);
        }

        $category->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return to_route('categories.index');
    }

    /**
     * Delete a category when it has no materials.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->learningMaterials()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Move or delete this category materials first.')]);

            return back();
        }

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return to_route('categories.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    private function uniqueSlug(string $name, ?Category $ignore = null): string
    {
        $baseSlug = Str::slug($name) ?: 'category';
        $slug = $baseSlug;
        $counter = 2;

        while (
            Category::query()
                ->where('slug', $slug)
                ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->getKey()))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * @return array<string, mixed>
     */
    private function categoryPayload(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'status' => $category->status,
            'learning_materials_count' => $category->learning_materials_count ?? 0,
            'created_at' => $category->created_at?->toISOString(),
            'created_at_formatted' => $category->created_at?->format('M j, Y'),
        ];
    }
}
