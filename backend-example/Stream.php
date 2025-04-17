<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stream extends Model
{
    use HasFactory;
    
    /**
     * Поля, доступные для массового присваивания
     */
    protected $fillable = [
        'date',
        'title',
        'link',
        'is_active',
        'platform',
        'event_id'
    ];
    
    /**
     * Преобразование типов
     */
    protected $casts = [
        'date' => 'date',
        'is_active' => 'boolean',
    ];
    
    /**
     * Отношение с событием
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
} 