<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AmenitySeeder::class);

        User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'phone' => '+15550001000',
                'is_staff' => true,
                'is_super_admin' => true,
                'qr_token' => Str::random(16),
                'password' => 'karma',
            ]
        );

        $staff = [
            ['username' => 'admin',  'name' => 'Admin'],
            ['username' => 'staff1', 'name' => 'Staff One'],
            ['username' => 'staff2', 'name' => 'Staff Two'],
        ];

        foreach ($staff as $member) {
            User::firstOrCreate(
                ['username' => $member['username']],
                [
                    'name' => $member['name'],
                    'phone' => '+1555000'.Str::random(4),
                    'is_staff' => true,
                    'qr_token' => Str::random(16),
                    'password' => 'karma',
                ]
            );
        }
    }
}
