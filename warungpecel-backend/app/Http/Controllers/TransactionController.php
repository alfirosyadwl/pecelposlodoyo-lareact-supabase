<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    // Menampilkan semua transaksi (terbaru di atas)
    public function index()
    {
        // with('user:id,name') digunakan untuk mengambil nama kasir tanpa memuat passwordnya
        $transactions = Transaction::with('user:id,name')->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json($transactions);
    }

    // Menyimpan transaksi baru
    public function store(Request $request)
    {
        // 1. Validasi bahwa data yang dikirim adalah array
        $request->validate([
            'transaction_date' => 'required|date',
            'warung' => 'required|string',
            'items' => 'required|array|min:1', // Wajib ada minimal 1 baris item
            'items.*.type' => 'required|in:pemasukan,pengeluaran',
            'items.*.description' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:1',
        ]);

        $userId = $request->user()->id;

        // 1. Buat ID unik untuk kelompok transaksi ini (Contoh: TRX-1698765432)
        $batchId = 'TRX-' . time() . '-' . rand(10, 99); 

        // 2. Simpan setiap item dengan batch_id yang sama
        foreach ($request->items as $item) {
            Transaction::create([
                'batch_id' => $batchId, // Masukkan batch_id ke database
                'user_id' => $userId,
                'warung' => $request->warung,
                'transaction_date' => $request->transaction_date,
                'type' => $item['type'],
                'description' => $item['description'],
                'amount' => $item['amount'],
            ]);
        }

        return response()->json([
            'message' => 'Semua transaksi berhasil dicatat'
        ], 201);
    }
    
    // Fitur Delete (Hanya untuk Admin)
    public function destroy(Request $request, $id) // Tambahkan Request $request ke parameter
    {
        // 1. Pengecekan keamanan: Jika bukan admin, tolak akses!
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Akses Ditolak. Hanya Admin yang boleh menghapus transaksi.'
            ], 403); 
        }

        // 2. Jika admin, lanjutkan proses hapus
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();
        
        return response()->json(['message' => 'Transaksi dihapus']);
    }

    // Fitur Edit Struk / Batch
    public function updateBatch(Request $request, $batch_id)
    {
        // 1. Ambil transaksi lama berdasarkan batch_id
        $existingTx = Transaction::where('batch_id', $batch_id)->get();

        if ($existingTx->isEmpty()) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        // 2. ATURAN KEAMANAN BARU:
        // Kasir hanya boleh mengedit jika ID pencatatnya SAMA dengan ID kasir yang login.
        // Admin boleh mengedit semuanya.
        $pencatatId = $existingTx->first()->user_id;
        if ($request->user()->role !== 'admin' && $request->user()->id !== $pencatatId) {
            return response()->json(['message' => 'Akses Ditolak. Anda hanya boleh mengedit transaksi yang Anda catat sendiri.'], 403);
        }

        // --- Sisa kodenya tetap sama seperti sebelumnya ---
        $request->validate([
            'transaction_date' => 'required|date',
            'warung' => 'required|string',
            'items' => 'required|array|min:1',
        ]);

        $existingIds = $existingTx->pluck('id')->toArray();
        $incomingIds = [];

        foreach ($request->items as $item) {
            if (isset($item['id'])) {
                // Update item yang sudah ada
                Transaction::where('id', $item['id'])->update([
                    'transaction_date' => $request->transaction_date,
                    'warung' => $request->warung,
                    'type' => $item['type'],
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                ]);
                $incomingIds[] = $item['id'];
            } else {
                // Item baru ditambahkan saat edit
                Transaction::create([
                    'batch_id' => $batch_id,
                    'user_id' => $pencatatId, // Gunakan ID pencatat asli
                    'transaction_date' => $request->transaction_date,
                    'warung' => $request->warung,
                    'type' => $item['type'],
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                ]);
            }
        }

        // Hapus item jika disilang (X)
        $toDelete = array_diff($existingIds, $incomingIds);
        if (!empty($toDelete)) {
            Transaction::whereIn('id', $toDelete)->delete();
        }

        return response()->json(['message' => 'Struk transaksi berhasil diperbarui']);
    }
}