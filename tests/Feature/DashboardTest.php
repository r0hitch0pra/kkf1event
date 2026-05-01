<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\User;
use Database\Seeders\AmenitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_loads_with_amenities_and_qr(): void
    {
        $this->seed(AmenitySeeder::class);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->withoutVite()->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('amenities', 3)
            ->has('qrSvg')
        );
    }

    public function test_amenity_status_is_null_when_not_signed_up(): void
    {
        $this->seed(AmenitySeeder::class);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->withoutVite()->get('/dashboard');

        $response->assertInertia(fn ($page) => $page
            ->where('amenities.0.status', null)
        );
    }

    public function test_patron_can_request_amenity(): void
    {
        $this->seed(AmenitySeeder::class);
        $user = User::factory()->create();
        $amenity = Amenity::where('slug', 'pool')->first();

        $response = $this->actingAs($user)->post("/amenities/{$amenity->id}/request");

        $response->assertRedirect();
        $this->assertDatabaseHas('amenity_signups', [
            'user_id' => $user->id,
            'amenity_id' => $amenity->id,
            'status' => 'requested',
        ]);
    }

    public function test_requesting_amenity_twice_is_idempotent(): void
    {
        $this->seed(AmenitySeeder::class);
        $user = User::factory()->create();
        $amenity = Amenity::where('slug', 'comedy')->first();

        $this->actingAs($user)->post("/amenities/{$amenity->id}/request");
        $this->actingAs($user)->post("/amenities/{$amenity->id}/request");

        $this->assertDatabaseCount('amenity_signups', 1);
    }
}
