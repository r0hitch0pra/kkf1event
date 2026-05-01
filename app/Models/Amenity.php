<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Amenity extends Model
{
    protected $fillable = ['slug', 'name', 'starts_at', 'ends_at', 'requires_assignment'];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'requires_assignment' => 'boolean',
        ];
    }

    public function signups(): HasMany
    {
        return $this->hasMany(AmenitySignup::class);
    }
}
