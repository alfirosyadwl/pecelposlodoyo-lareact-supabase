<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\IsAdmin; // 1. Tambahkan import Middleware ini

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

// Rute yang butuh token (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // 2. Gunakan IsAdmin::class di sini
    Route::middleware(IsAdmin::class)->group(function () {
        Route::apiResource('users', UserController::class);
    });
});