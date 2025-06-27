<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'image_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Отношение к изображениям
     */
    public function images()
    {
        return $this->hasMany(Image::class)->orderBy('position', 'asc');
    }

    /**
     * Главное изображение галереи
     */
    public function mainImage()
    {
        return $this->belongsTo(Image::class, 'image_id');
    }
} 