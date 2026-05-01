<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\AmenitySignup;
use App\Models\User;
use Database\Seeders\AmenitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_staff_cannot_access_admin(): void
    {
        $patron = User::factory()->create();

        $this->actingAs($patron)->get('/admin')->assertRedirect('/dashboard');
    }

    public function test_staff_can_access_admin_home(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->withoutVite()->get('/admin')
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Admin/Home'));
    }

    public function test_staff_can_access_scan_page(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->withoutVite()->get('/admin/scan')
            ->assertStatus(200)
            ->assertInertia(fn ($p) => $p->component('Admin/Scan'));
    }

    public function test_lookup_returns_user_by_token(): void
    {
        $this->seed(AmenitySeeder::class);
        $staff = User::factory()->staff()->create();
        $patron = User::factory()->create(['qr_token' => 'testtoken1234567']);

        $response = $this->actingAs($staff)->postJson('/admin/lookup', ['token' => 'testtoken1234567']);

        $response->assertOk()
            ->assertJsonPath('user.id', $patron->id)
            ->assertJsonPath('user.name', $patron->name);
    }

    public function test_lookup_returns_404_for_unknown_token(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff)->postJson('/admin/lookup', ['token' => 'doesnotexist'])
            ->assertStatus(404);
    }

    public function test_staff_can_assign_amenity(): void
    {
        $this->seed(AmenitySeeder::class);
        $staff = User::factory()->staff()->create();
        $patron = User::factory()->create();
        $amenity = Amenity::where('slug', 'pool')->first();

        $this->actingAs($staff)->postJson('/admin/assign', [
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
            'assignment' => 'Table 3',
        ])->assertOk()->assertJsonPath('assignment', 'Table 3');

        $this->assertDatabaseHas('amenity_signups', [
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
            'assignment' => 'Table 3',
        ]);
    }

    public function test_staff_can_activate_amenity(): void
    {
        $this->seed(AmenitySeeder::class);
        $staff = User::factory()->staff()->create();
        $patron = User::factory()->create();
        $amenity = Amenity::where('slug', 'comedy')->first();

        AmenitySignup::create([
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
            'status' => 'requested',
        ]);

        $this->actingAs($staff)->postJson('/admin/activate', [
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
        ])->assertOk()->assertJsonPath('status', 'active');

        $this->assertDatabaseHas('amenity_signups', [
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
            'status' => 'active',
        ]);
    }

    public function test_staff_can_complete_amenity(): void
    {
        $this->seed(AmenitySeeder::class);
        $staff = User::factory()->staff()->create();
        $patron = User::factory()->create();
        $amenity = Amenity::where('slug', 'f1_party')->first();

        AmenitySignup::create([
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
            'status' => 'active',
        ]);

        $this->actingAs($staff)->postJson('/admin/complete', [
            'user_id' => $patron->id,
            'amenity_id' => $amenity->id,
        ])->assertOk()->assertJsonPath('status', 'done');
    }
}
