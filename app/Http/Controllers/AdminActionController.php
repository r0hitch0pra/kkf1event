<?php

namespace App\Http\Controllers;

use App\Events\AmenityStatusChanged;
use App\Events\FriendStatusChanged;
use App\Models\AmenitySignup;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActionController extends Controller
{
    public function assign(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amenity_id' => 'required|exists:amenities,id',
            'assignment' => 'nullable|string|max:50',
        ]);

        $signup = AmenitySignup::firstOrCreate(
            ['user_id' => $request->user_id, 'amenity_id' => $request->amenity_id],
            ['status' => 'requested']
        );

        $signup->update(['assignment' => $request->assignment]);
        $signup->refresh()->loadMissing('amenity');

        $this->broadcastChange($signup);

        return response()->json($this->signupPayload($signup));
    }

    public function activate(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amenity_id' => 'required|exists:amenities,id',
        ]);

        $signup = AmenitySignup::firstOrCreate(
            ['user_id' => $request->user_id, 'amenity_id' => $request->amenity_id],
            ['status' => 'requested']
        );

        $signup->update(['status' => 'active', 'activated_at' => now()]);
        $signup->refresh()->loadMissing('amenity');

        $this->broadcastChange($signup);

        return response()->json($this->signupPayload($signup));
    }

    public function complete(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amenity_id' => 'required|exists:amenities,id',
        ]);

        $signup = AmenitySignup::firstOrCreate(
            ['user_id' => $request->user_id, 'amenity_id' => $request->amenity_id],
            ['status' => 'requested']
        );

        $signup->update(['status' => 'done']);
        $signup->refresh()->loadMissing('amenity');

        $this->broadcastChange($signup);

        return response()->json($this->signupPayload($signup));
    }

    private function broadcastChange(AmenitySignup $signup): void
    {
        broadcast(new AmenityStatusChanged(
            $signup->user_id,
            $signup->amenity_id,
            $signup->amenity->slug,
            $signup->amenity->name,
            $signup->amenity->requires_assignment,
            $signup->status,
            $signup->assignment,
        ));

        $user = User::with('friends')->find($signup->user_id);
        $friendIds = $user->friends->pluck('id')->all();

        if (! empty($friendIds)) {
            broadcast(new FriendStatusChanged(
                $friendIds,
                $signup->user_id,
                $user->name,
                $signup->amenity_id,
                $signup->amenity->slug,
                $signup->status,
                $signup->assignment,
            ));
        }
    }

    private function signupPayload(AmenitySignup $signup): array
    {
        return [
            'id' => $signup->id,
            'amenity_id' => $signup->amenity_id,
            'status' => $signup->status,
            'assignment' => $signup->assignment,
        ];
    }
}
