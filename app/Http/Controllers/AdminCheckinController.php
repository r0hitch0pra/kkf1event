<?php

namespace App\Http\Controllers;

use App\Events\PatronCheckedIn;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminCheckinController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Signup', ['staffCheckin' => true]);
    }

    public function store(SignupRequest $request): RedirectResponse
    {
        $staffId = $request->user()->id;

        $user = User::firstOrCreate(
            ['phone' => $request->phone],
            ['qr_token' => Str::random(16)],
        );

        $updates = ['checked_in_by' => $staffId];

        if ($request->filled('name')) {
            $updates['name'] = $request->name;
            $updates['party_size'] = $request->party_size;
        }

        $user->update($updates);

        $user->refresh()->load(['amenitySignups.amenity', 'checkedInBy']);

        broadcast(new PatronCheckedIn($this->patronPayload($user)));

        return redirect()->route('admin.users');
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
