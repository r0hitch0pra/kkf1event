<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStaffRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminStaffController extends Controller
{
    public function index(): Response
    {
        $staff = User::where('is_staff', true)
            ->orderBy('is_super_admin', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'is_super_admin' => $user->is_super_admin,
            ]);

        return Inertia::render('Admin/Staff', ['staff' => $staff]);
    }

    public function store(StoreStaffRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => $request->password,
            'is_staff' => true,
            'is_super_admin' => false,
            'phone' => '+1000'.Str::random(7),
            'qr_token' => Str::random(16),
        ]);

        return redirect()->route('admin.staff.index')->with('success', 'Staff member created.');
    }
}
