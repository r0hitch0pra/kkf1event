<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            [
                'slug' => 'pool',
                'name' => 'Pool Tables',
                'starts_at' => '2026-05-01 19:00:00',
                'ends_at' => '2026-05-02 02:00:00',
                'requires_assignment' => true,
            ],
            [
                'slug' => 'comedy',
                'name' => 'Comedy Show',
                'starts_at' => '2026-05-01 20:30:00',
                'ends_at' => '2026-05-01 22:00:00',
                'requires_assignment' => false,
            ],
            [
                'slug' => 'f1_party',
                'name' => 'F1 Watch Party',
                'starts_at' => '2026-05-01 22:00:00',
                'ends_at' => '2026-05-02 02:00:00',
                'requires_assignment' => false,
            ],
        ];

        foreach ($amenities as $amenity) {
            Amenity::updateOrCreate(
                ['slug' => $amenity['slug']],
                $amenity,
            );
        }
    }
}
