<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image as ImageIntervention;

class ApiGalleryController extends Controller
{
    /**
     * Получить список всех галерей
     */
    public function index(): JsonResponse
    {
        $galleries = Gallery::with(['images' => function ($query) {
            $query->orderBy('position', 'asc');
        }])->get();

        return response()->json($galleries);
    }

    /**
     * Создать новую галерею
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $gallery = Gallery::create([
            'title' => $request->title,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gallery created successfully',
            'data' => $gallery
        ], 201);
    }

    /**
     * Получить галерею с изображениями
     */
    public function show($id): JsonResponse
    {
        $gallery = Gallery::with(['images' => function ($query) {
            $query->orderBy('position', 'asc');
        }])->find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery not found'
            ], 404);
        }

        return response()->json($gallery);
    }

    /**
     * Обновить галерею
     */
    public function update(Request $request, $id): JsonResponse
    {
        $gallery = Gallery::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $gallery->update($request->only(['title']));

        return response()->json([
            'success' => true,
            'message' => 'Gallery updated successfully',
            'data' => $gallery
        ]);
    }

    /**
     * Удалить галерею
     */
    public function destroy($id): JsonResponse
    {
        $gallery = Gallery::with('images')->find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery not found'
            ], 404);
        }

        // Удаляем все изображения галереи
        foreach ($gallery->images as $image) {
            $this->deleteImageFiles($image);
        }

        $gallery->images()->delete();
        $gallery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gallery deleted successfully'
        ]);
    }

    /**
     * Загрузить изображения в галерею (поддерживает множественную загрузку)
     */
    public function uploadImage(Request $request, $id): JsonResponse
    {
        $gallery = Gallery::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery not found'
            ], 404);
        }

        // Проверяем, есть ли файлы для загрузки
        if (!$request->hasFile('image') && !$request->hasFile('images')) {
            return response()->json([
                'success' => false,
                'message' => 'No images provided'
            ], 422);
        }

        $uploadedImages = [];
        $errors = [];

        // Получаем файлы (один или несколько)
        $files = [];
        if ($request->hasFile('image')) {
            $files[] = $request->file('image');
        }
        if ($request->hasFile('images')) {
            $files = array_merge($files, $request->file('images'));
        }

        // Обрабатываем файлы по очереди
        foreach ($files as $index => $file) {
            // Валидируем каждый файл
            $validator = Validator::make(['image' => $file], [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'errors' => $validator->errors()->first()
                ];
                continue;
            }

            try {
                $uploadedImage = $this->processAndSaveImage($file, $gallery);
                $uploadedImages[] = $uploadedImage;
                
                // Логируем прогресс
                \Log::info("Uploaded image {$index + 1} of " . count($files) . ": " . $file->getClientOriginalName());
                
            } catch (\Exception $e) {
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage()
                ];
                \Log::error("Failed to upload image: " . $file->getClientOriginalName() . " - " . $e->getMessage());
            }
        }

        // Формируем ответ
        $response = [
            'success' => count($uploadedImages) > 0,
            'message' => $this->generateUploadMessage(count($uploadedImages), count($errors)),
            'uploaded' => $uploadedImages,
            'total_files' => count($files),
            'uploaded_count' => count($uploadedImages),
            'error_count' => count($errors),
        ];

        if (count($errors) > 0) {
            $response['errors'] = $errors;
        }

        $statusCode = count($uploadedImages) > 0 ? 201 : 422;
        return response()->json($response, $statusCode);
    }

    /**
     * Обработать и сохранить изображение
     */
    private function processAndSaveImage($file, $gallery): array
    {
        $fileName = Str::random(32) . '.' . $file->getClientOriginalExtension();
        
        // Создаем папку для галереи если её нет
        $galleryPath = "galleries/{$gallery->id}";
        if (!Storage::disk('public')->exists($galleryPath)) {
            Storage::disk('public')->makeDirectory($galleryPath);
        }

        // Обрабатываем изображение
        $image = ImageIntervention::make($file);
        
        // Изменяем размер до 1600px по ширине, сохраняя пропорции
        $image->resize(1600, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        // Накладываем логотип если включен
        $this->applyLogoToImage($image, request());

        // Сохраняем основное изображение
        $imagePath = "{$galleryPath}/{$fileName}";
        $image->save(storage_path("app/public/{$imagePath}"), 80, 'jpeg');

        // Создаем thumbnail (50px высота)
        $thumbnail = ImageIntervention::make($file);
        $thumbnail->resize(null, 50, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Накладываем логотип на thumbnail если включен
        $this->applyLogoToImage($thumbnail, request(), true);
        
        $thumbnailPath = "{$galleryPath}/thmb_{$fileName}";
        $thumbnail->save(storage_path("app/public/{$thumbnailPath}"), 80, 'jpeg');

        // Сохраняем информацию в базу данных
        $imageModel = Image::create([
            'title' => null,
            'image' => $imagePath,
            'gallery_id' => $gallery->id,
            'position' => Image::where('gallery_id', $gallery->id)->max('position') + 1,
        ]);

        return [
            'id' => $imageModel->id,
            'title' => $imageModel->title,
            'image' => $imagePath,
            'thumbnail' => Storage::disk('public')->url($thumbnailPath),
            'gallery_image_path' => Storage::disk('public')->url($imagePath),
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'processed_size' => Storage::disk('public')->size($imagePath),
        ];
    }

    /**
     * Наложить логотип на изображение
     */
    private function applyLogoToImage($image, Request $request, bool $isThumbnail = false): void
    {
        // Проверяем, включен ли логотип
        if (!$request->has('logo_enabled') || $request->logo_enabled !== 'true') {
            return;
        }

        try {
            $logoImage = null;
            
            // Получаем логотип в зависимости от источника
            if ($request->hasFile('custom_logo')) {
                // Используем загруженный кастомный логотип
                $logoImage = ImageIntervention::make($request->file('custom_logo'));
            } elseif ($request->has('default_logo_url') && !empty($request->default_logo_url)) {
                // Используем логотип по умолчанию
                $logoUrl = $request->default_logo_url;
                
                // Если URL относительный, добавляем базовый путь
                if (!filter_var($logoUrl, FILTER_VALIDATE_URL)) {
                    $logoUrl = storage_path("app/public/{$logoUrl}");
                }
                
                // Загружаем изображение по URL
                $logoImage = ImageIntervention::make($logoUrl);
            }
            
            if (!$logoImage) {
                return;
            }
            
            // Получаем настройки логотипа
            $position = $request->get('logo_position', 'bottom-right');
            $size = (int) $request->get('logo_size', 15);
            $opacity = (float) $request->get('logo_opacity', 0.8);
            
            // Вычисляем размер логотипа
            $imageWidth = $image->width();
            $imageHeight = $image->height();
            $logoWidth = ($imageWidth * $size) / 100;
            $logoHeight = ($logoWidth * $logoImage->height()) / $logoImage->width();
            
            // Для thumbnail используем меньший размер
            if ($isThumbnail) {
                $logoWidth = min($logoWidth, 20); // Максимум 20px для thumbnail
                $logoHeight = ($logoWidth * $logoImage->height()) / $logoImage->width();
            }
            
            // Изменяем размер логотипа
            $logoImage->resize($logoWidth, $logoHeight, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            
            // Применяем прозрачность
            if ($opacity < 1) {
                $logoImage->opacity($opacity * 100);
            }
            
            // Вычисляем позицию логотипа
            $x = 0;
            $y = 0;
            $padding = 10; // Отступ от краев
            
            switch ($position) {
                case 'top-left':
                    $x = $padding;
                    $y = $padding;
                    break;
                case 'top-right':
                    $x = $imageWidth - $logoWidth - $padding;
                    $y = $padding;
                    break;
                case 'bottom-left':
                    $x = $padding;
                    $y = $imageHeight - $logoHeight - $padding;
                    break;
                case 'bottom-right':
                default:
                    $x = $imageWidth - $logoWidth - $padding;
                    $y = $imageHeight - $logoHeight - $padding;
                    break;
            }
            
            // Накладываем логотип на изображение
            $image->insert($logoImage, 'top-left', $x, $y);
            
        } catch (\Exception $e) {
            // Логируем ошибку, но не прерываем обработку изображения
            \Log::warning("Failed to apply logo to image: " . $e->getMessage());
        }
    }

    /**
     * Генерировать сообщение о результатах загрузки
     */
    private function generateUploadMessage(int $uploadedCount, int $errorCount): string
    {
        if ($uploadedCount === 0 && $errorCount === 0) {
            return 'No files were processed';
        }

        if ($uploadedCount === 0) {
            return "Failed to upload {$errorCount} file(s)";
        }

        if ($errorCount === 0) {
            return "Successfully uploaded {$uploadedCount} file(s)";
        }

        return "Successfully uploaded {$uploadedCount} file(s), {$errorCount} failed";
    }

    /**
     * Обновить изображение (название)
     */
    public function updateImage(Request $request, $id): JsonResponse
    {
        $gallery = Gallery::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'image_id' => 'required|integer|exists:images,id',
            'title' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $image = Image::where('id', $request->image_id)
                     ->where('gallery_id', $gallery->id)
                     ->first();

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found in this gallery'
            ], 404);
        }

        $image->update([
            'title' => $request->title
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image updated successfully',
            'data' => $image
        ]);
    }

    /**
     * Удалить изображение из галереи
     */
    public function deleteImage(Request $request, $id): JsonResponse
    {
        $gallery = Gallery::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Gallery not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'image_id' => 'required|integer|exists:images,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $image = Image::where('id', $request->image_id)
                     ->where('gallery_id', $gallery->id)
                     ->first();

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found in this gallery'
            ], 404);
        }

        // Удаляем файлы изображения
        $this->deleteImageFiles($image);

        // Удаляем запись из базы данных
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully'
        ]);
    }

    /**
     * Удалить файлы изображения
     */
    private function deleteImageFiles(Image $image): void
    {
        try {
            // Удаляем основное изображение
            if ($image->image && Storage::disk('public')->exists($image->image)) {
                Storage::disk('public')->delete($image->image);
            }

            // Удаляем thumbnail
            $thumbnailPath = str_replace('.', '/thmb_', $image->image);
            if (Storage::disk('public')->exists($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }
        } catch (\Exception $e) {
            // Логируем ошибку, но не прерываем выполнение
            \Log::error('Error deleting image files: ' . $e->getMessage());
        }
    }
} 