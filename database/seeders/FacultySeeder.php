<?php

namespace Database\Seeders;

use App\Models\Faculty;
use Illuminate\Database\Seeder;

class FacultySeeder extends Seeder
{
    /**
     * Seed the university faculties shown in the academic structure.
     */
    public function run(): void
    {
        $faculties = [
            [
                'code' => 'FEAS',
                'name' => 'Faculty of Economics and Agricultural Sciences',
            ],
            [
                'code' => 'FBA',
                'name' => 'Faculty of Business Administration',
            ],
            [
                'code' => 'FTH',
                'name' => 'Faculty of Tourism and Hospitality',
            ],
            [
                'code' => 'FST',
                'name' => 'Faculty of Science and Technology',
            ],
            [
                'code' => 'FEA',
                'name' => 'Faculty of Engineering and Architecture',
            ],
            [
                'code' => 'FAHL',
                'name' => 'Faculty of Arts, Humanities, and Languages',
            ],
            [
                'code' => 'FLSS',
                'name' => 'Faculty of Law and Social Sciences',
            ],
            [
                'code' => 'SDS',
                'name' => 'School of Doctoral Studies',
            ],
        ];

        foreach ($faculties as $faculty) {
            Faculty::query()->updateOrCreate(
                ['code' => $faculty['code']],
                ['name' => $faculty['name']],
            );
        }
    }
}
