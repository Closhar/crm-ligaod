<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdminPage;
use App\Models\MenuSection;

class AdminPagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Пустой массив - тестовые данные убраны
        $pages = [];

        foreach ($pages as $page) {
            AdminPage::updateOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }
} 