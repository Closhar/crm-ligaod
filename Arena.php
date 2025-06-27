<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Arena extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'description',
        'capacity',
        'city_id',
        'status'
    ];

    protected $casts = [
        'capacity' => 'integer',
        'status' => 'boolean'
    ];

    /**
     * Отношение morphedByMany для спортов
     */
    public function sports(): MorphToMany
    {
        return $this->morphedByMany(Sport::class, 'sportable', 'sportables');
    }

    /**
     * Отношение к городу
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Получить количество связанных спортов
     */
    public function getSportsCountAttribute(): int
    {
        return $this->sports()->count();
    }
} 