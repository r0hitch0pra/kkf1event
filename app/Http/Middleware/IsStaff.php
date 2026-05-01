<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('admin.login');
        }

        if (! $request->user()->is_staff) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
