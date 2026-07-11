<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\LearningMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LearningMaterial>
 */
class LearningMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->sentence(),
            'type' => 'pdf',
            'status' => 'draft',
            'disk' => 'public',
            'path' => 'learning-materials/fake/material.pdf',
            'original_name' => 'material.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 1024,
            'published_at' => null,
        ];
    }
}
