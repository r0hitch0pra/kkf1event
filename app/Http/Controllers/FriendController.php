<?php

namespace App\Http\Controllers;

use App\Events\FriendAdded;
use App\Events\FriendRemoved;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['nullable', 'string'],
            'token' => ['nullable', 'string'],
            'phone' => ['required_without:token'],
            'token' => ['required_without:phone'],
        ]);

        $me = $request->user();

        $friend = $request->filled('token')
            ? User::where('qr_token', $request->token)->where('is_staff', false)->first()
            : User::where('phone', $request->phone)->where('is_staff', false)->first();

        if (! $friend) {
            return back()->withErrors(['friend' => "That person hasn't signed up yet."]);
        }

        if ($friend->id === $me->id) {
            return back()->withErrors(['friend' => "You can't add yourself."]);
        }

        if (DB::table('friendships')->where('user_id', $me->id)->where('friend_id', $friend->id)->exists()) {
            return back()->withErrors(['friend' => 'Already friends!']);
        }

        DB::table('friendships')->insert([
            ['user_id' => $me->id, 'friend_id' => $friend->id, 'created_at' => now()],
            ['user_id' => $friend->id, 'friend_id' => $me->id, 'created_at' => now()],
        ]);

        broadcast(new FriendAdded($me->id, $this->friendPayload($friend)));
        broadcast(new FriendAdded($friend->id, $this->friendPayload($me)));

        return back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $me = $request->user();

        DB::table('friendships')
            ->where(fn ($q) => $q->where('user_id', $me->id)->where('friend_id', $user->id))
            ->orWhere(fn ($q) => $q->where('user_id', $user->id)->where('friend_id', $me->id))
            ->delete();

        // Notify the other person so their dashboard drops the card too
        broadcast(new FriendRemoved($user->id, $me->id));

        return back();
    }

    private function friendPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'signups' => $user->amenitySignups()->with('amenity')->get()
                ->map(fn ($s) => [
                    'slug' => $s->amenity->slug,
                    'status' => $s->status,
                    'assignment' => $s->assignment,
                ])
                ->keyBy('slug'),
        ];
    }
}
