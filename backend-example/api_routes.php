<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\EventStreamController;
use App\Http\Controllers\Api\StreamController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Здесь вы можете зарегистрировать маршруты API для вашего приложения.
|
*/

// Маршруты для управления событиями
Route::apiResource('events', EventController::class);

// Вложенные маршруты для управления стримами, относящимися к событию
Route::apiResource('events.streams', EventStreamController::class)->only(['index', 'store']);

// Маршруты для управления отдельными стримами (обновление, удаление)
Route::apiResource('streams', StreamController::class)->only(['update', 'destroy']); 