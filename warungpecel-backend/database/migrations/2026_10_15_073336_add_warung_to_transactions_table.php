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
        Schema::table('transactions', function (Blueprint $table) {
            // Tambahkan kolom warung setelah user_id
            $table->string('warung')->default('Warung Utama')->after('user_id');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('warung');
        });
    }
};
