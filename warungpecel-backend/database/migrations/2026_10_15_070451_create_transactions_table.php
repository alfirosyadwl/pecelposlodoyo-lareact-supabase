<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // Menyimpan ID user (kasir/admin) yang mencatat transaksi
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Jenis transaksi
            $table->enum('type', ['pemasukan', 'pengeluaran']);
            
            // Jumlah uang (menggunakan bigInteger agar aman untuk nominal Rupiah yang besar)
            $table->bigInteger('amount'); 
            
            $table->string('description'); // Contoh: "Penjualan Nasi Goreng 10 Porsi" atau "Beli Gas LPG"
            $table->date('transaction_date'); // Tanggal transaksi
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
