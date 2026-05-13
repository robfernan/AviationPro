<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    protected $fillable = [
        'flight_date',
        'flight_time',
        'departure_time',
        'arrival_time',
        'pilot_role',
        'solo',
        'cross_country',
        'night',
        'instructor',
        'departure_airport',
        'arrival_airport',
        'aircraft_registration',
        'aircraft_type',
        'flight_type',
        'notes',
        'takeoffs',
        'landings',
        'actual_instrument',
        'simulated_instrument',
    ];

    protected $casts = [
        'flight_date' => 'date',
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'flight_time' => 'decimal:2',
        'solo' => 'boolean',
        'cross_country' => 'boolean',
        'night' => 'boolean',
        'instructor' => 'boolean',
        'takeoffs' => 'integer',
        'landings' => 'integer',
        'actual_instrument' => 'decimal:2',
        'simulated_instrument' => 'decimal:2',
    ];

    public const PILOT_ROLE_LABELS = [
        'pic' => 'PIC',
        'sic' => 'SIC',
        'solo' => 'Solo',
        'dual_received' => 'Dual Received',
        'dual_given' => 'Dual Given',
    ];

    public function pilotRoleLabel(): string
    {
        return self::PILOT_ROLE_LABELS[$this->pilot_role] ?? 'Unspecified';
    }

    public function routeLabel(): string
    {
        return trim(($this->departure_airport ?? '') . ' → ' . ($this->arrival_airport ?? ''));
    }

    public function totalTimeHours(): float
    {
        return (float) $this->flight_time;
    }

    public function instrumentTimeHours(): float
    {
        return (float) $this->actual_instrument + (float) $this->simulated_instrument;
    }

    public function picTimeHours(): float
    {
        return $this->pilot_role === 'pic' ? $this->totalTimeHours() : 0.0;
    }

    public function soloTimeHours(): float
    {
        return $this->solo ? $this->totalTimeHours() : 0.0;
    }

    public function crossCountryTimeHours(): float
    {
        return $this->cross_country ? $this->totalTimeHours() : 0.0;
    }

    public function nightTimeHours(): float
    {
        return $this->night ? $this->totalTimeHours() : 0.0;
    }

    public function nightSoloTimeHours(): float
    {
        return $this->night && $this->solo ? $this->totalTimeHours() : 0.0;
    }

    public function soloCrossCountryTimeHours(): float
    {
        return $this->solo && $this->cross_country ? $this->totalTimeHours() : 0.0;
    }

    public function dualReceivedTimeHours(): float
    {
        return ($this->pilot_role === 'dual_received' || $this->instructor) ? $this->totalTimeHours() : 0.0;
    }

    public function dualGivenTimeHours(): float
    {
        return $this->pilot_role === 'dual_given' ? $this->totalTimeHours() : 0.0;
    }

    public function dayTimeHours(): float
    {
        return $this->night ? 0.0 : $this->totalTimeHours();
    }

    public static function summaryTotals($flights)
    {
        return [
            'total_time' => round($flights->sum(fn ($flight) => $flight->totalTimeHours()), 1),
            'pic_time' => round($flights->sum(fn ($flight) => $flight->picTimeHours()), 1),
            'solo_time' => round($flights->sum(fn ($flight) => $flight->soloTimeHours()), 1),
            'cross_country_time' => round($flights->sum(fn ($flight) => $flight->crossCountryTimeHours()), 1),
            'night_time' => round($flights->sum(fn ($flight) => $flight->nightTimeHours()), 1),
            'night_solo_time' => round($flights->sum(fn ($flight) => $flight->nightSoloTimeHours()), 1),
            'solo_cross_country_time' => round($flights->sum(fn ($flight) => $flight->soloCrossCountryTimeHours()), 1),
            'dual_received_time' => round($flights->sum(fn ($flight) => $flight->dualReceivedTimeHours()), 1),
            'dual_given_time' => round($flights->sum(fn ($flight) => $flight->dualGivenTimeHours()), 1),
            'day_time' => round($flights->sum(fn ($flight) => $flight->dayTimeHours()), 1),
            'instrument_time' => round($flights->sum(fn ($flight) => $flight->instrumentTimeHours()), 1),
            'takeoffs' => $flights->sum(fn ($flight) => (int) $flight->takeoffs),
            'landings' => $flights->sum(fn ($flight) => (int) $flight->landings),
        ];
    }
}
