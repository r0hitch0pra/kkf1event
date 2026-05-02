<?php

namespace App\Http\Controllers;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HtmlResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Admin/Home');
    }

    public function scan(): Response
    {
        return Inertia::render('Admin/Scan');
    }

    public function users(): Response
    {
        $users = User::where('is_staff', false)
            ->with(['amenitySignups.amenity', 'checkedInBy'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => [
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
            ]);

        return Inertia::render('Admin/Users', ['users' => $users]);
    }

    public function doorQr(): HtmlResponse
    {
        $url = config('app.url').'/checkin';

        $renderer = new ImageRenderer(
            new RendererStyle(600),
            new SvgImageBackEnd
        );

        $qrSvg = (new Writer($renderer))->writeString($url);

        return response()->make(
            view('door-qr', ['qrSvg' => $qrSvg, 'url' => $url])->render(),
            200,
            ['Content-Type' => 'text/html']
        );
    }

    public function lookup(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        $user = User::where('qr_token', $request->token)
            ->with(['amenitySignups.amenity'])
            ->first();

        if (! $user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'party_size' => $user->party_size,
            ],
            'signups' => $user->amenitySignups->map(fn ($s) => [
                'id' => $s->id,
                'amenity_id' => $s->amenity_id,
                'amenity_slug' => $s->amenity->slug,
                'amenity_name' => $s->amenity->name,
                'requires_assignment' => $s->amenity->requires_assignment,
                'status' => $s->status,
                'assignment' => $s->assignment,
            ]),
        ]);
    }
}
