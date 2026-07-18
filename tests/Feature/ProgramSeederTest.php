<?php

use App\Models\Faculty;
use App\Models\Program;
use Database\Seeders\FacultySeeder;
use Database\Seeders\ProgramSeeder;

test('program seeder creates programs for every faculty without duplicates', function () {
    $this->seed(FacultySeeder::class);
    $this->seed(ProgramSeeder::class);
    $this->seed(ProgramSeeder::class);

    expect(Faculty::query()->withCount('programs')->pluck('programs_count', 'code')->all())
        ->toBe([
            'FEAS' => 1,
            'FBA' => 17,
            'FTH' => 2,
            'FST' => 8,
            'FEA' => 8,
            'FAHL' => 7,
            'FLSS' => 6,
            'SDS' => 2,
        ])
        ->and(Program::query()->count())->toBe(51)
        ->and(Program::query()->where('code', 'BIT')->value('name'))
        ->toBe('Bachelor of Science in Information Technology')
        ->and(Program::query()->where('code', 'PHD-ECON')->value('name'))
        ->toBe('Doctor of Philosophy (Ph.D.) in Economics');
});
