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
            // Menambahkan kolom batch_id (Nomor Struk)
            $table->string('batch_id')->nullable()->after('id');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('batch_id');
        });
    }
};
