<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuSection;

class MenuSectionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Пустой массив - тестовые данные убраны
        $sections = [];

        foreach ($sections as $section) {
            MenuSection::updateOrCreate(
                ['name' => $section['name']],
                $section
            );
        }
    }
} 