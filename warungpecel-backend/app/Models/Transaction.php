<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'user_id',
        'warung',
        'type',
        'amount',
        'description',
        'transaction_date'
    ];

    // Relasi: Satu transaksi dimiliki oleh satu user (kasir/admin)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}