<?php

namespace App\Http\Controllers;

use App\Events\PatronCheckedIn;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SignupController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Signup');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('checkin');
    }

    public function lookup(Request $request): JsonResponse
    {
        $exists = User::where('phone', $request->input('phone', ''))
            ->where('is_staff', false)
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    public function store(SignupRequest $request): RedirectResponse
    {
        $user = User::firstOrCreate(
            ['phone' => $request->phone],
            ['qr_token' => Str::random(16)],
        );

        if ($request->filled('name')) {
            $user->update([
                'name' => $request->name,
                'party_size' => $request->party_size,
            ]);
        }

        Auth::login($user);

        $user->refresh()->load(['amenitySignups.amenity', 'checkedInBy']);

        broadcast(new PatronCheckedIn($this->patronPayload($user)));

        return redirect()->route('dashboard');
    }

    private function patronPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'party_size' => $user->party_size,
            'checked_in_by_name' => $user->checkedInBy?->name ?? 'Self',
            'created_at' => $user->created_at->format('g:i A'),
            'signups' => $user->amenitySignups->map(fn ($s) => [
                'amenity_id' => $s->amenity_id,
                'slug' => $s->amenity->slug,
                'amenity_name' => $s->amenity->name,
                'requires_assignment' => $s->amenity->requires_assignment,
                'status' => $s->status,
                'assignment' => $s->assignment,
            ])->keyBy('slug'),
        ];
    }
}
