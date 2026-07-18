<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\ClassGroup;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentManagementController extends Controller
{
    public function create(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering): Response
    {
        $this->authorizeOffering($request, $classGroup, $courseOffering);

        return Inertia::render('academic/assignments/form', [
            'assignment' => null,
            'context' => $this->context($classGroup, $courseOffering),
        ]);
    }

    public function store(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering): RedirectResponse
    {
        $user = $this->authorizeOffering($request, $classGroup, $courseOffering);
        $courseOffering->assignments()->create([
            ...$request->validate($this->rules()),
            'created_by' => $user->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Assignment created.')]);

        return to_route('classes.show', $classGroup);
    }

    public function edit(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering, Assignment $assignment): Response
    {
        $this->authorizeAssignment($request, $classGroup, $courseOffering, $assignment);

        return Inertia::render('academic/assignments/form', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'instructions' => $assignment->instructions ?? '',
                'due_at' => $assignment->due_at?->format('Y-m-d\TH:i') ?? '',
                'points' => $assignment->points,
                'status' => $assignment->status,
            ],
            'context' => $this->context($classGroup, $courseOffering),
        ]);
    }

    public function update(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering, Assignment $assignment): RedirectResponse
    {
        $this->authorizeAssignment($request, $classGroup, $courseOffering, $assignment);
        $assignment->update($request->validate($this->rules()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Assignment updated.')]);

        return to_route('classes.show', $classGroup);
    }

    public function destroy(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering, Assignment $assignment): RedirectResponse
    {
        $this->authorizeAssignment($request, $classGroup, $courseOffering, $assignment);
        $assignment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Assignment deleted.')]);

        return to_route('classes.show', $classGroup);
    }

    /** @return array<string, mixed> */
    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'instructions' => ['nullable', 'string', 'max:5000'],
            'due_at' => ['nullable', 'date'],
            'points' => ['required', 'integer', 'between:1,10000'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ];
    }

    private function authorizeOffering(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering): User
    {
        abort_unless($courseOffering->class_group_id === $classGroup->id, 404);
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        abort_unless($user->hasRole('admin') || $courseOffering->professor_id === $user->id, 403);

        return $user;
    }

    private function authorizeAssignment(Request $request, ClassGroup $classGroup, CourseOffering $courseOffering, Assignment $assignment): User
    {
        abort_unless($assignment->course_offering_id === $courseOffering->id, 404);

        return $this->authorizeOffering($request, $classGroup, $courseOffering);
    }

    /** @return array<string, int|string> */
    private function context(ClassGroup $classGroup, CourseOffering $courseOffering): array
    {
        $courseOffering->loadMissing('course');

        return [
            'class_id' => $classGroup->id,
            'class_code' => $classGroup->code,
            'offering_id' => $courseOffering->id,
            'course_name' => $courseOffering->course->name,
            'course_code' => $courseOffering->course->code,
        ];
    }
}
