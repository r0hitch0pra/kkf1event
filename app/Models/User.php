<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'name',
        'party_size',
        'is_staff',
        'is_super_admin',
        'checked_in_by',
        'qr_token',
        'username',
        'password',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'is_staff' => 'boolean',
            'is_super_admin' => 'boolean',
            'party_size' => 'integer',
            'password' => 'hashed',
        ];
    }

    public function amenitySignups(): HasMany
    {
        return $this->hasMany(AmenitySignup::class);
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function friends(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id');
    }
}
