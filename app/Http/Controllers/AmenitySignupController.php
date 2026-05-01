<?php

namespace App\Http\Controllers;

use App\Events\AmenityStatusChanged;
use App\Events\FriendStatusChanged;
use App\Models\Amenity;
use App\Models\AmenitySignup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AmenitySignupController extends Controller
{
    public function store(Request $request, Amenity $amenity): RedirectResponse
    {
        $user = $request->user();

        $signup = AmenitySignup::firstOrCreate([
            'user_id' => $user->id,
            'amenity_id' => $amenity->id,
        ], [
            'status' => 'requested',
        ]);

        // Only broadcast if the row was just created (not a duplicate tap)
        if ($signup->wasRecentlyCreated) {
            broadcast(new AmenityStatusChanged(
                $user->id,
                $amenity->id,
                $amenity->slug,
                $amenity->name,
                $amenity->requires_assignment,
                'requested',
                null,
            ));

            $user->load('friends');
            $friendIds = $user->friends->pluck('id')->all();

            if (! empty($friendIds)) {
                broadcast(new FriendStatusChanged(
                    $friendIds,
                    $user->id,
                    $user->name,
                    $amenity->id,
                    $amenity->slug,
                    'requested',
                    null,
                ));
            }
        }

        return back();
    }
}
