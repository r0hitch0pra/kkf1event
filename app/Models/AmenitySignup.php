<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmenitySignup extends Model
{
    protected $fillable = ['user_id', 'amenity_id', 'status', 'assignment', 'activated_at'];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function amenity(): BelongsTo
    {
        return $this->belongsTo(Amenity::class);
    }
}
