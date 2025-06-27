<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'gallery_id',
        'position',
    ];

    protected $casts = [
        'position' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Отношение к галерее
     */
    public function gallery()
    {
        return $this->belongsTo(Gallery::class);
    }

    /**
     * Получить полный URL изображения
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return \Storage::disk('public')->url($this->image);
        }
        return null;
    }

    /**
     * Получить полный URL thumbnail
     */
    public function getThumbnailUrlAttribute()
    {
        if ($this->image) {
            $thumbnailPath = str_replace('.', '/thmb_', $this->image);
            return \Storage::disk('public')->url($thumbnailPath);
        }
        return null;
    }
} 