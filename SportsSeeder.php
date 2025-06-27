<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sport;

class SportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sports = [
            [
                'name' => 'Футбол',
                'description' => 'Командный вид спорта с мячом',
                'icon' => '⚽',
                'status' => true
            ],
            [
                'name' => 'Баскетбол',
                'description' => 'Командная игра с мячом и кольцами',
                'icon' => '🏀',
                'status' => true
            ],
            [
                'name' => 'Волейбол',
                'description' => 'Командная игра с мячом через сетку',
                'icon' => '🏐',
                'status' => true
            ],
            [
                'name' => 'Теннис',
                'description' => 'Игра с ракетками и мячом',
                'icon' => '🎾',
                'status' => true
            ],
            [
                'name' => 'Хоккей',
                'description' => 'Командная игра на льду с клюшками',
                'icon' => '🏒',
                'status' => true
            ],
            [
                'name' => 'Бокс',
                'description' => 'Контактный вид спорта',
                'icon' => '🥊',
                'status' => true
            ],
            [
                'name' => 'Плавание',
                'description' => 'Водный вид спорта',
                'icon' => '🏊',
                'status' => true
            ],
            [
                'name' => 'Легкая атлетика',
                'description' => 'Королева спорта',
                'icon' => '🏃',
                'status' => true
            ],
            [
                'name' => 'Гимнастика',
                'description' => 'Спортивная и художественная гимнастика',
                'icon' => '🤸',
                'status' => true
            ],
            [
                'name' => 'Борьба',
                'description' => 'Вольная и греко-римская борьба',
                'icon' => '🤼',
                'status' => true
            ]
        ];

        foreach ($sports as $sport) {
            Sport::updateOrCreate(
                ['name' => $sport['name']],
                $sport
            );
        }
    }
} 