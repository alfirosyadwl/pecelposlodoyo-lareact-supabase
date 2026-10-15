<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\IsAdmin; // 1. Tambahkan import Middleware ini
use App\Http\Controllers\TransactionController; // Tambahkan ini di atas

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

// Rute yang butuh token (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // ---- RUTE KASIR & ADMIN ----
    Route::apiResource('transactions', TransactionController::class);
    // Tambahkan rute Edit Batch di sini:
    Route::put('/transactions/batch/{batch_id}', [TransactionController::class, 'updateBatch']);
    // ----------------------------
    
    // 2. Gunakan IsAdmin::class di sini
    Route::middleware(IsAdmin::class)->group(function () {
        Route::apiResource('users', UserController::class);
    });
});