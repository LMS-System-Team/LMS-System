<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_offerings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->restrictOnDelete();
            $table->foreignId('professor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('room')->nullable();
            $table->timestamps();

            $table->unique(['class_group_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_offerings');
    }
};
