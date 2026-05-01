<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SignupTest extends TestCase
{
    use RefreshDatabase;

    public function test_signup_page_loads(): void
    {
        $response = $this->withoutVite()->get('/signup');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Signup'));
    }

    public function test_guest_can_sign_up(): void
    {
        $response = $this->post('/signup', [
            'phone' => '+15550001234',
            'name' => 'Jane Doe',
            'party_size' => 3,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'phone' => '+15550001234',
            'name' => 'Jane Doe',
            'party_size' => 3,
        ]);
    }

    public function test_returning_user_is_logged_in(): void
    {
        User::factory()->create(['phone' => '+15550001234', 'qr_token' => 'abcdef1234567890']);

        $response = $this->post('/signup', [
            'phone' => '+15550001234',
            'name' => 'Updated Name',
            'party_size' => 2,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'phone' => '+15550001234',
            'name' => 'Updated Name',
            'party_size' => 2,
        ]);
    }

    public function test_checkin_redirects_to_dashboard_when_authenticated(): void
    {
        $user = User::factory()->create(['qr_token' => 'abcdef1234567890']);

        $response = $this->actingAs($user)->withoutVite()->get('/checkin');

        $response->assertRedirect('/dashboard');
    }
}
