<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $academic_year_id
 * @property string $name
 * @property Carbon $starts_at
 * @property Carbon $ends_at
 */
#[Fillable(['academic_year_id', 'name', 'starts_at', 'ends_at'])]
class Semester extends Model
{
    protected function casts(): array
    {
        return ['starts_at' => 'date', 'ends_at' => 'date'];
    }

    /** @return BelongsTo<AcademicYear, $this> */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /** @return HasMany<ClassGroup, $this> */
    public function classGroups(): HasMany
    {
        return $this->hasMany(ClassGroup::class);
    }
}
