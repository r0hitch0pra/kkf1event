<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAmenityController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Amenities', [
            'amenities' => Amenity::orderBy('starts_at')->get()->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'slug' => $a->slug,
                'starts_at' => $a->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $a->ends_at?->format('Y-m-d\TH:i'),
            ]),
        ]);
    }

    public function update(Request $request, Amenity $amenity): RedirectResponse
    {
        $request->validate([
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $amenity->update([
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
        ]);

        return back()->with('success', "{$amenity->name} updated.");
    }
}
