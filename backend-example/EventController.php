<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Получить список всех событий с подсчетом связанных стримов
     */
    public function index(Request $request)
    {
        $query = Event::query()->withCount('streams');
        
        // Поиск
        if ($request->has('q')) {
            $searchTerm = $request->get('q');
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }
        
        // Сортировка
        if ($request->has('sort_field') && $request->has('sort_direction')) {
            $sortField = $request->get('sort_field');
            $sortDirection = $request->get('sort_direction', 'asc');
            
            // Особая обработка для сортировки по количеству стримов
            if ($sortField === 'streams_count') {
                $query->orderBy('streams_count', $sortDirection);
            } else {
                $query->orderBy($sortField, $sortDirection);
            }
        } else {
            $query->orderBy('date', 'desc');
        }
        
        // Фильтрация по статусу
        if ($request->has('status') && !empty($request->get('status'))) {
            $query->where('status', $request->get('status'));
        }
        
        // Фильтрация по id
        if ($request->has('id') && !empty($request->get('id'))) {
            $query->where('id', $request->get('id'));
        }
        
        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }
    
    /**
     * Получить одно событие с подсчетом связанных стримов
     */
    public function show($id)
    {
        return Event::withCount('streams')->findOrFail($id);
    }
    
    /**
     * Создать новое событие
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'status' => 'required|in:active,canceled,upcoming',
            'description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $event = Event::create($validator->validated());
        
        return response()->json($event, 201);
    }
    
    /**
     * Обновить существующее событие
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:active,canceled,upcoming',
            'description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $event->update($validator->validated());
        
        return response()->json($event);
    }
    
    /**
     * Удалить событие
     */
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();
        
        return response()->json(null, 204);
    }
} 