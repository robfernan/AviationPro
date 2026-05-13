<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->date('flight_date');
            $table->decimal('flight_time', 6, 2)->default(0);
            $table->dateTime('departure_time')->nullable();
            $table->dateTime('arrival_time')->nullable();
            $table->string('pilot_role')->nullable();
            $table->boolean('solo')->default(false);
            $table->boolean('cross_country')->default(false);
            $table->boolean('night')->default(false);
            $table->boolean('instructor')->default(false);
            $table->string('departure_airport');
            $table->string('arrival_airport');
            $table->string('aircraft_registration');
            $table->string('aircraft_type');
            $table->string('flight_type');
            $table->text('notes')->nullable();
            $table->unsignedInteger('takeoffs')->default(0);
            $table->unsignedInteger('landings')->default(0);
            $table->decimal('actual_instrument', 6, 2)->default(0);
            $table->decimal('simulated_instrument', 6, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};
