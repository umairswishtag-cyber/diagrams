<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagrams', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        $userIds = DB::table('users')->orderBy('id')->limit(2)->pluck('id');

        if ($userIds->count() === 1) {
            DB::table('diagrams')->whereNull('user_id')->update(['user_id' => $userIds->first()]);
        }
    }

    public function down(): void
    {
        Schema::table('diagrams', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
