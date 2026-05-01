<?php

use App\Http\Controllers\AdminActionController;
use App\Http\Controllers\AdminAmenityController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminCheckinController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminStaffController;
use App\Http\Controllers\AmenitySignupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\SignupController;
use App\Http\Middleware\IsStaff;
use App\Http\Middleware\IsSuperAdmin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Patron auth
Route::post('/phone-lookup', [SignupController::class, 'lookup'])->name('phone.lookup');

Route::middleware('guest')->group(function () {
    Route::get('/checkin', fn () => Inertia::render('Checkin'))->name('checkin');
    Route::get('/signup', [SignupController::class, 'show'])->name('signup');
    Route::post('/signup', [SignupController::class, 'store'])->name('signup.store');
});

// Patron dashboard
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::post('/amenities/{amenity}/request', [AmenitySignupController::class, 'store'])->name('amenities.request');
    Route::post('/friends', [FriendController::class, 'store'])->name('friends.store');
    Route::delete('/friends/{user}', [FriendController::class, 'destroy'])->name('friends.destroy');
    Route::post('/logout', [SignupController::class, 'logout'])->name('logout');
});

// Admin auth (public)
Route::get('/admin/login', [AdminAuthController::class, 'show'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'store'])->name('admin.login.store');
Route::post('/admin/logout', [AdminAuthController::class, 'destroy'])->name('admin.logout')->middleware('auth');

// Admin protected (IsStaff handles both auth + role check)
Route::middleware(IsStaff::class)->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'home'])->name('home');
    Route::get('/scan', [AdminController::class, 'scan'])->name('scan');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/checkin', [AdminCheckinController::class, 'show'])->name('checkin');
    Route::post('/checkin', [AdminCheckinController::class, 'store'])->name('checkin.store');
    Route::post('/lookup', [AdminController::class, 'lookup'])->name('lookup');
    Route::post('/assign', [AdminActionController::class, 'assign'])->name('assign');
    Route::post('/activate', [AdminActionController::class, 'activate'])->name('activate');
    Route::post('/complete', [AdminActionController::class, 'complete'])->name('complete');

    // Super admin only
    Route::middleware(IsSuperAdmin::class)->group(function () {
        Route::get('/staff', [AdminStaffController::class, 'index'])->name('staff.index');
        Route::post('/staff', [AdminStaffController::class, 'store'])->name('staff.store');
        Route::get('/amenities', [AdminAmenityController::class, 'index'])->name('amenities.index');
        Route::post('/amenities/{amenity}', [AdminAmenityController::class, 'update'])->name('amenities.update');
    });
});
