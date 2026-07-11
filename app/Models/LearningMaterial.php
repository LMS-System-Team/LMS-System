<?php

namespace App\Models;

use Database\Factories\LearningMaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property string $type
 * @property string $status
 * @property string $disk
 * @property string $path
 * @property string $original_name
 * @property string|null $mime_type
 * @property string|null $extension
 * @property int $size_bytes
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'category_id',
    'title',
    'slug',
    'description',
    'type',
    'status',
    'disk',
    'path',
    'original_name',
    'mime_type',
    'extension',
    'size_bytes',
    'published_at',
])]
class LearningMaterial extends Model
{
    /** @use HasFactory<LearningMaterialFactory> */
    use HasFactory;

    public const TYPES = ['video', 'pdf', 'audiobook'];

    public const STATUSES = ['draft', 'published'];

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'size_bytes' => 'integer',
        ];
    }
}
