<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Sport extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean'
    ];

    /**
     * Отношение morphedByMany для арен
     */
    public function arenas(): MorphToMany
    {
        return $this->morphedByMany(Arena::class, 'sportable', 'sportables');
    }

    /**
     * Отношение morphedByMany для статей
     */
    public function articles(): MorphToMany
    {
        return $this->morphedByMany(Article::class, 'sportable', 'sportables');
    }

    /**
     * Отношение morphedByMany для соревнований
     */
    public function competitions(): MorphToMany
    {
        return $this->morphedByMany(Competition::class, 'sportable', 'sportables');
    }

    /**
     * Отношение morphedByMany для событий
     */
    public function events(): MorphToMany
    {
        return $this->morphedByMany(Event::class, 'sportable', 'sportables');
    }
} 