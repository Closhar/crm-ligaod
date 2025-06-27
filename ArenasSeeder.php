<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Arena;
use App\Models\City;

class ArenasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Получаем или создаем тестовый город
        $city = City::firstOrCreate(
            ['name' => 'Москва'],
            [
                'name' => 'Москва',
                'status' => true
            ]
        );

        $arenas = [
            [
                'name' => 'Лужники',
                'address' => 'Лужнецкая набережная, 24',
                'description' => 'Центральный стадион России',
                'capacity' => 81000,
                'city_id' => $city->id,
                'status' => true
            ],
            [
                'name' => 'ВТБ Арена',
                'address' => 'Ленинградский проспект, 39',
                'description' => 'Многофункциональный спортивный комплекс',
                'capacity' => 15000,
                'city_id' => $city->id,
                'status' => true
            ],
            [
                'name' => 'Олимпийский',
                'address' => 'Олимпийский проспект, 16',
                'description' => 'Крытый спортивный комплекс',
                'capacity' => 35000,
                'city_id' => $city->id,
                'status' => true
            ],
            [
                'name' => 'Крылья Советов',
                'address' => 'Волгоградский проспект, 46',
                'description' => 'Футбольный стадион',
                'capacity' => 45000,
                'city_id' => $city->id,
                'status' => true
            ],
            [
                'name' => 'Динамо',
                'address' => 'Ленинградский проспект, 36',
                'description' => 'Исторический стадион',
                'capacity' => 26000,
                'city_id' => $city->id,
                'status' => true
            ]
        ];

        foreach ($arenas as $arena) {
            Arena::updateOrCreate(
                ['name' => $arena['name']],
                $arena
            );
        }
    }
} 