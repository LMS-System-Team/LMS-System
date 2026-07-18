<?php

namespace App\Http\Controllers;

use App\Models\ClassGroup;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Program;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClassGroupManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        return Inertia::render('academic/classes/index', [
            'classes' => ClassGroup::query()
                ->with(['program', 'semester.academicYear'])
                ->withCount(['courseOfferings', 'students'])
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")))
                ->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (ClassGroup $classGroup): array => $this->payload($classGroup)),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('academic/classes/form', [
            'classroom' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules($request));
        $offerings = $request->array('offerings');
        $studentIds = $request->array('student_ids');

        DB::transaction(function () use ($validated, $offerings, $studentIds): void {
            $classGroup = ClassGroup::query()->create($this->classValues($validated));
            $this->syncRelationships($classGroup, $offerings, $studentIds);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Class created.')]);

        return to_route('academic.classes.index');
    }

    public function edit(ClassGroup $classGroup): Response
    {
        $classGroup->load(['courseOfferings', 'students']);

        return Inertia::render('academic/classes/form', [
            'classroom' => [
                'id' => $classGroup->id,
                'name' => $classGroup->name,
                'code' => $classGroup->code,
                'program_id' => (string) $classGroup->program_id,
                'semester_id' => (string) $classGroup->semester_id,
                'color' => $classGroup->color,
                'status' => $classGroup->status,
                'offerings' => $classGroup->courseOfferings->map(fn (CourseOffering $offering): array => [
                    'id' => $offering->id,
                    'course_id' => (string) $offering->course_id,
                    'professor_id' => $offering->professor_id === null ? '' : (string) $offering->professor_id,
                    'room' => $offering->room ?? '',
                ])->values()->all(),
                'student_ids' => $classGroup->students->pluck('id')->map(fn (int $id): string => (string) $id)->values()->all(),
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(Request $request, ClassGroup $classGroup): RedirectResponse
    {
        $validated = $request->validate($this->rules($request, $classGroup));
        $offerings = $request->array('offerings');
        $studentIds = $request->array('student_ids');
        $keptIds = array_filter(array_map('intval', array_column($request->array('offerings'), 'id')));

        if ($classGroup->courseOfferings()->whereNotIn('id', $keptIds)->whereHas('assignments')->exists()) {
            throw ValidationException::withMessages([
                'offerings' => __('A subject with assignments cannot be removed from this class.'),
            ]);
        }

        DB::transaction(function () use ($classGroup, $validated, $offerings, $studentIds): void {
            $classGroup->update($this->classValues($validated));
            $this->syncRelationships($classGroup, $offerings, $studentIds);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Class updated.')]);

        return to_route('academic.classes.index');
    }

    public function destroy(ClassGroup $classGroup): RedirectResponse
    {
        if ($classGroup->courseOfferings()->whereHas('assignments')->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Delete the class assignments before deleting this class.'),
            ]);

            return back();
        }

        $classGroup->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Class deleted.')]);

        return to_route('academic.classes.index');
    }

    /** @return array<string, mixed> */
    private function rules(Request $request, ?ClassGroup $classGroup = null): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('class_groups')->where('semester_id', $request->input('semester_id'))->ignore($classGroup?->id),
            ],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'semester_id' => ['required', 'integer', 'exists:semesters,id'],
            'color' => ['required', Rule::in(['violet', 'blue', 'emerald', 'amber'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'offerings' => ['sometimes', 'array'],
            'offerings.*.id' => ['nullable', 'integer', Rule::exists('course_offerings', 'id')->where('class_group_id', $classGroup?->id)],
            'offerings.*.course_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('courses', 'id')->where('program_id', $request->input('program_id')),
            ],
            'offerings.*.professor_id' => ['nullable', 'integer', 'exists:users,id'],
            'offerings.*.room' => ['nullable', 'string', 'max:100'],
            'student_ids' => ['sometimes', 'array'],
            'student_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ];
    }

    /** @param array<string, mixed> $validated
     * @return array<string, mixed>
     */
    private function classValues(array $validated): array
    {
        return collect($validated)->only(['name', 'code', 'program_id', 'semester_id', 'color', 'status'])->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $offerings
     * @param  array<int, mixed>  $studentIds
     */
    private function syncRelationships(ClassGroup $classGroup, array $offerings, array $studentIds): void
    {
        $keptIds = [];

        foreach ($offerings as $offeringValues) {
            $offeringId = filter_var($offeringValues['id'] ?? null, FILTER_VALIDATE_INT) ?: null;
            $offering = $offeringId === null
                ? new CourseOffering(['class_group_id' => $classGroup->id])
                : $classGroup->courseOfferings()->whereKey($offeringId)->firstOrFail();

            $offering->fill([
                'course_id' => (int) $offeringValues['course_id'],
                'professor_id' => empty($offeringValues['professor_id']) ? null : (int) $offeringValues['professor_id'],
                'room' => empty($offeringValues['room']) ? null : (string) $offeringValues['room'],
            ]);
            $offering->save();
            $keptIds[] = $offering->id;
        }

        $classGroup->courseOfferings()->whereNotIn('id', $keptIds)->delete();
        $classGroup->students()->sync(array_map('intval', $studentIds));
    }

    /** @return array<string, mixed> */
    private function formOptions(): array
    {
        return [
            'programs' => Program::query()->orderBy('name')->get(['id', 'name', 'code']),
            'semesters' => Semester::query()->with('academicYear')->orderByDesc('starts_at')->get()->map(fn (Semester $semester): array => [
                'id' => $semester->id,
                'name' => $semester->name,
                'academic_year' => $semester->academicYear->name,
            ]),
            'courses' => Course::query()->orderBy('name')->get(['id', 'program_id', 'name', 'code']),
            'professors' => User::role('professor')->orderBy('name')->get(['id', 'name', 'email']),
            'students' => User::role('user')->orderBy('name')->get(['id', 'name', 'email']),
        ];
    }

    /** @return array<string, mixed> */
    private function payload(ClassGroup $classGroup): array
    {
        return [
            'id' => $classGroup->id,
            'name' => $classGroup->name,
            'code' => $classGroup->code,
            'program' => $classGroup->program->name,
            'semester' => $classGroup->semester->name,
            'academic_year' => $classGroup->semester->academicYear->name,
            'status' => $classGroup->status,
            'subjects_count' => (int) $classGroup->getAttribute('course_offerings_count'),
            'students_count' => (int) $classGroup->getAttribute('students_count'),
        ];
    }
}
