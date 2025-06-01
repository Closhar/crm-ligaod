// Маршруты для работы с телеграм
Route::prefix('telegram')->group(function () {
    Route::get('/channels', [TelegramController::class, 'getChannels']);
    Route::post('/send', [TelegramController::class, 'sendMessage']);
}); 