<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'phone' => '+1555'.fake()->unique()->numerify('#######'),
            'name' => fake()->name(),
            'party_size' => fake()->numberBetween(1, 8),
            'is_staff' => false,
            'qr_token' => Str::random(16),
        ];
    }

    public function staff(): static
    {
        return $this->state(fn () => ['is_staff' => true]);
    }
}
