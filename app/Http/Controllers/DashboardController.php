<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->is_staff) {
            return redirect()->route('admin.home');
        }

        $signups = $user->amenitySignups()->with('amenity')->get()->keyBy('amenity_id');

        $amenities = Amenity::orderBy('id')->get()->map(function (Amenity $amenity) use ($signups) {
            $signup = $signups->get($amenity->id);

            return [
                'id' => $amenity->id,
                'slug' => $amenity->slug,
                'name' => $amenity->name,
                'requires_assignment' => $amenity->requires_assignment,
                'starts_at' => $amenity->starts_at?->toIso8601String(),
                'ends_at' => $amenity->ends_at?->toIso8601String(),
                'status' => $signup?->status,
                'assignment' => $signup?->assignment,
            ];
        });

        $friends = $user->friends()->with(['amenitySignups.amenity'])->get()->map(fn ($friend) => [
            'id' => $friend->id,
            'name' => $friend->name,
            'signups' => $friend->amenitySignups->map(fn ($s) => [
                'slug' => $s->amenity->slug,
                'status' => $s->status,
                'assignment' => $s->assignment,
            ])->keyBy('slug'),
        ]);

        $svg = $this->generateQr($user->qr_token);

        return Inertia::render('Dashboard', [
            'amenities' => $amenities,
            'friends' => $friends,
            'qrSvg' => $svg,
        ]);
    }

    private function generateQr(string $token): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd
        );

        return (new Writer($renderer))->writeString($token);
    }
}
