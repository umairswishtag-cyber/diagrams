<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagrams', function (Blueprint $table) {
            $table->json('pages')->nullable()->after('edges');
        });
    }

    public function down(): void
    {
        Schema::table('diagrams', function (Blueprint $table) {
            $table->dropColumn('pages');
        });
    }
};
