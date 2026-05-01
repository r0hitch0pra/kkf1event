<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()?->is_staff) {
            return redirect()->route('admin.home');
        }

        return Inertia::render('Admin/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
            return back()->withErrors(['username' => 'Invalid credentials.']);
        }

        $request->session()->regenerate();

        return redirect()->route('admin.home');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
