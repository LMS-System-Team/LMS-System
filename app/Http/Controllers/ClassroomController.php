<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\ClassGroup;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $classes = $this->accessibleClasses($user)
            ->with(['program.faculty', 'semester.academicYear'])
            ->withCount(['courseOfferings', 'students'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (ClassGroup $classGroup): array => [
                'id' => $classGroup->id,
                'name' => $classGroup->name,
                'code' => $classGroup->code,
                'color' => $classGroup->color,
                'program' => $classGroup->program->name,
                'faculty' => $classGroup->program->faculty->name,
                'semester' => $classGroup->semester->name,
                'academic_year' => $classGroup->semester->academicYear->name,
                'subjects_count' => (int) $classGroup->getAttribute('course_offerings_count'),
                'students_count' => (int) $classGroup->getAttribute('students_count'),
            ]);

        return Inertia::render('classes/index', ['classes' => $classes]);
    }

    public function show(Request $request, ClassGroup $classGroup): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        abort_unless(
            $this->accessibleClasses($user)->whereKey($classGroup)->exists(),
            404,
        );

        $classGroup->load([
            'program.faculty',
            'semester.academicYear',
            'courseOfferings.course',
            'courseOfferings.professor',
            'courseOfferings.assignments' => fn ($query) => $query
                ->where('status', 'published')
                ->orderByDesc('created_at'),
        ])->loadCount('students');

        return Inertia::render('classes/show', [
            'classroom' => [
                'id' => $classGroup->id,
                'name' => $classGroup->name,
                'code' => $classGroup->code,
                'color' => $classGroup->color,
                'program' => $classGroup->program->name,
                'faculty' => $classGroup->program->faculty->name,
                'semester' => $classGroup->semester->name,
                'academic_year' => $classGroup->semester->academicYear->name,
                'students_count' => (int) $classGroup->getAttribute('students_count'),
                'subjects' => $classGroup->courseOfferings
                    ->map(fn (CourseOffering $offering): array => [
                        'id' => $offering->id,
                        'code' => $offering->course->code,
                        'name' => $offering->course->name,
                        'description' => $offering->course->description,
                        'credits' => $offering->course->credits,
                        'room' => $offering->room,
                        'professor' => $offering->professor?->name,
                        'can_manage' => $user->hasRole('admin') || $offering->professor_id === $user->id,
                        'assignments' => $offering->assignments
                            ->map(fn (Assignment $assignment): array => [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'instructions' => $assignment->instructions,
                                'points' => $assignment->points,
                                'due_at' => $assignment->due_at?->toIso8601String(),
                                'due_at_formatted' => $assignment->due_at?->format('M j, Y \a\t g:i A'),
                                'created_at_formatted' => $assignment->created_at?->diffForHumans(),
                            ])->values()->all(),
                    ])->values()->all(),
            ],
        ]);
    }

    /** @return Builder<ClassGroup> */
    private function accessibleClasses(User $user): Builder
    {
        $query = ClassGroup::query()->where('status', 'active');

        if ($user->hasRole('admin')) {
            return $query;
        }

        if ($user->hasRole('professor')) {
            return $query->whereHas(
                'courseOfferings',
                fn (Builder $offering) => $offering->where('professor_id', $user->id),
            );
        }

        return $query->whereHas(
            'students',
            fn (Builder $student) => $student->where('users.id', $user->id),
        );
    }
}
