<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed the application's roles and CRUD permissions.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.view',
            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',
            'learning-materials.view',
            'learning-materials.create',
            'learning-materials.update',
            'learning-materials.delete',
            'classes.view',
            'classes.create',
            'classes.update',
            'classes.delete',
            'faculties.view',
            'faculties.create',
            'faculties.update',
            'faculties.delete',
            'programs.view',
            'programs.create',
            'programs.update',
            'programs.delete',
            'academic-years.view',
            'academic-years.create',
            'academic-years.update',
            'academic-years.delete',
            'semesters.view',
            'semesters.create',
            'semesters.update',
            'semesters.delete',
            'courses.view',
            'courses.create',
            'courses.update',
            'courses.delete',
            'assignments.view',
            'assignments.create',
            'assignments.update',
            'assignments.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissionModels = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', $permissions)
            ->get()
            ->keyBy('name')
            ->toBase();

        $user = Role::findOrCreate('user', 'web');
        $professor = Role::findOrCreate('professor', 'web');
        $admin = Role::findOrCreate('admin', 'web');

        $user->syncPermissions($permissionModels->only([
            'learning-materials.view',
            'classes.view',
            'assignments.view',
        ])->values());

        $professor->syncPermissions($permissionModels->only([
            'categories.view',
            'learning-materials.view',
            'learning-materials.create',
            'learning-materials.update',
            'learning-materials.delete',
            'classes.view',
            'courses.view',
            'assignments.view',
            'assignments.create',
            'assignments.update',
            'assignments.delete',
        ])->values());

        $admin->syncPermissions($permissionModels->values());

        Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', [
                'permissions.create',
                'permissions.update',
                'permissions.delete',
            ])
            ->get()
            ->each->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
