<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\LearningMaterial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class LmsContentSeeder extends Seeder
{
    /**
     * Seed sample LMS categories and learning materials.
     */
    public function run(): void
    {
        $disk = (string) config('lms.media_disk', 'public');

        $categories = [
            [
                'name' => 'English Foundation',
                'slug' => 'english-foundation',
                'description' => 'Beginner lessons for grammar, vocabulary, and pronunciation.',
                'status' => 'active',
            ],
            [
                'name' => 'Business Communication',
                'slug' => 'business-communication',
                'description' => 'Professional speaking, writing, and presentation materials.',
                'status' => 'active',
            ],
            [
                'name' => 'Exam Preparation',
                'slug' => 'exam-preparation',
                'description' => 'Practice resources for quizzes, QCM exercises, and assessments.',
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }

        $foundation = Category::query()->where('slug', 'english-foundation')->firstOrFail();
        $business = Category::query()->where('slug', 'business-communication')->firstOrFail();
        $exam = Category::query()->where('slug', 'exam-preparation')->firstOrFail();

        $this->createMaterial($foundation, [
            'title' => 'Welcome Video',
            'slug' => 'welcome-video',
            'description' => 'A short sample video entry for the LMS library.',
            'type' => 'video',
            'path' => 'learning-materials/seed/english-foundation/welcome-video.mp4',
            'original_name' => 'welcome-video.mp4',
            'mime_type' => 'video/mp4',
            'extension' => 'mp4',
            'contents' => "Seed placeholder for a video file.\nReplace this with a real MP4 upload from the backend.",
        ], $disk);

        $this->createMaterial($business, [
            'title' => 'Email Writing Guide',
            'slug' => 'email-writing-guide',
            'description' => 'A sample PDF guide for business communication lessons.',
            'type' => 'pdf',
            'path' => 'learning-materials/seed/business-communication/email-writing-guide.pdf',
            'original_name' => 'email-writing-guide.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'contents' => $this->samplePdf(),
        ], $disk);

        $this->createMaterial($exam, [
            'title' => 'Listening Practice Audio',
            'slug' => 'listening-practice-audio',
            'description' => 'A tiny silent WAV placeholder for audiobook/listening material.',
            'type' => 'audiobook',
            'path' => 'learning-materials/seed/exam-preparation/listening-practice-audio.wav',
            'original_name' => 'listening-practice-audio.wav',
            'mime_type' => 'audio/wav',
            'extension' => 'wav',
            'contents' => base64_decode('UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=', true) ?: '',
        ], $disk);
    }

    /**
     * @param  array<string, string>  $material
     */
    private function createMaterial(Category $category, array $material, string $disk): void
    {
        Storage::disk($disk)->put($material['path'], $material['contents']);

        LearningMaterial::query()->updateOrCreate(
            [
                'category_id' => $category->id,
                'slug' => $material['slug'],
            ],
            [
                'title' => $material['title'],
                'description' => $material['description'],
                'type' => $material['type'],
                'status' => 'published',
                'disk' => $disk,
                'path' => $material['path'],
                'original_name' => $material['original_name'],
                'mime_type' => $material['mime_type'],
                'extension' => $material['extension'],
                'size_bytes' => Storage::disk($disk)->size($material['path']),
                'published_at' => now(),
            ],
        );
    }

    private function samplePdf(): string
    {
        return <<<'PDF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 78 >>
stream
BT
/F1 16 Tf
36 96 Td
(Sample LMS PDF material) Tj
0 -28 Td
(Replace this with a real upload.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000236 00000 n
0000000365 00000 n
trailer
<< /Root 1 0 R /Size 6 >>
startxref
435
%%EOF
PDF;
    }
}
