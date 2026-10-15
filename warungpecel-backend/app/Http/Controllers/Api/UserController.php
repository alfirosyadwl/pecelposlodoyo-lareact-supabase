<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // 1. Tampilkan semua user (Kecuali Admin Utama sendiri)
    public function index(Request $request)
    {
        // Menampilkan semua user selain user yang sedang login
        $users = User::where('id', '!=', $request->user()->id)->get();
        return response()->json($users);
    }

    // 2. Tambah Karyawan Baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Password harus di-hash
        ]);

        return response()->json(['message' => 'Karyawan berhasil ditambahkan', 'user' => $user], 201);
    }

    // 3. Tampilkan satu karyawan (untuk diedit)
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    // 4. Update Karyawan
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id, // Email unik kecuali milik dia sendiri
            'password' => 'nullable|min:6' // Password opsional saat update
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        
        // Jika password diisi, update passwordnya
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'Data karyawan berhasil diupdate', 'user' => $user]);
    }

    // 5. Hapus Karyawan
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Karyawan berhasil dihapus']);
    }
}