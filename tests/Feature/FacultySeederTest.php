<?php

use App\Models\Faculty;
use Database\Seeders\FacultySeeder;

test('faculty seeder creates the university faculty structure without duplicates', function () {
    $this->seed(FacultySeeder::class);
    $this->seed(FacultySeeder::class);

    expect(Faculty::query()->orderBy('code')->pluck('name', 'code')->all())
        ->toBe([
            'FAHL' => 'Faculty of Arts, Humanities, and Languages',
            'FBA' => 'Faculty of Business Administration',
            'FEA' => 'Faculty of Engineering and Architecture',
            'FEAS' => 'Faculty of Economics and Agricultural Sciences',
            'FLSS' => 'Faculty of Law and Social Sciences',
            'FST' => 'Faculty of Science and Technology',
            'FTH' => 'Faculty of Tourism and Hospitality',
            'SDS' => 'School of Doctoral Studies',
        ]);
});
