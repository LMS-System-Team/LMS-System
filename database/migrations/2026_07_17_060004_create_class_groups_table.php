<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->restrictOnDelete();
            $table->foreignId('semester_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('code');
            $table->string('color', 20)->default('violet');
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['semester_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_groups');
    }
};
