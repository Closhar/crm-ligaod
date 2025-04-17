<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;
    
    /**
     * Поля, доступные для массового присваивания
     */
    protected $fillable = [
        'title',
        'date',
        'status',
        'description'
    ];
    
    /**
     * Преобразование типов
     */
    protected $casts = [
        'date' => 'date',
    ];
    
    /**
     * Подсчитываемые связи
     */
    protected $withCount = ['streams'];
    
    /**
     * Отношение с потоками (стримами)
     */
    public function streams()
    {
        return $this->hasMany(Stream::class);
    }
} 