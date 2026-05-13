<?php

namespace App\Livewire;

use App\Models\Flight;
use Livewire\Component;

class FlightDashboard extends Component
{
    public ?int $editingFlightId = null;

    public string $flight_date = '';
    public string $flight_time = '0';
    public ?string $departure_time = null;
    public ?string $arrival_time = null;
    public ?string $pilot_role = null;
    public bool $solo = false;
    public bool $cross_country = false;
    public bool $night = false;
    public bool $instructor = false;
    public string $departure_airport = '';
    public string $arrival_airport = '';
    public string $aircraft_registration = '';
    public string $aircraft_type = '';
    public string $flight_type = 'training';
    public ?string $notes = null;
    public int $takeoffs = 0;
    public int $landings = 0;
    public string $actual_instrument = '0';
    public string $simulated_instrument = '0';

    public function mount(): void
    {
        $this->flight_date = now()->format('Y-m-d');
    }

    public function saveFlight(): void
    {
        $validated = $this->validate($this->rules());

        if ($this->editingFlightId) {
            Flight::findOrFail($this->editingFlightId)->update($validated);
        } else {
            Flight::create($validated);
        }

        $this->resetForm();
        session()->flash('status', 'Flight saved successfully.');
    }

    public function editFlight(int $flightId): void
    {
        $flight = Flight::findOrFail($flightId);

        $this->editingFlightId = $flight->id;
        $this->flight_date = optional($flight->flight_date)->format('Y-m-d') ?? now()->format('Y-m-d');
        $this->flight_time = (string) $flight->flight_time;
        $this->departure_time = optional($flight->departure_time)?->format('Y-m-d\TH:i');
        $this->arrival_time = optional($flight->arrival_time)?->format('Y-m-d\TH:i');
        $this->pilot_role = $flight->pilot_role;
        $this->solo = $flight->solo;
        $this->cross_country = $flight->cross_country;
        $this->night = $flight->night;
        $this->instructor = $flight->instructor;
        $this->departure_airport = $flight->departure_airport;
        $this->arrival_airport = $flight->arrival_airport;
        $this->aircraft_registration = $flight->aircraft_registration;
        $this->aircraft_type = $flight->aircraft_type;
        $this->flight_type = $flight->flight_type;
        $this->notes = $flight->notes;
        $this->takeoffs = (int) $flight->takeoffs;
        $this->landings = (int) $flight->landings;
        $this->actual_instrument = (string) $flight->actual_instrument;
        $this->simulated_instrument = (string) $flight->simulated_instrument;
    }

    public function deleteFlight(int $flightId): void
    {
        Flight::findOrFail($flightId)->delete();

        if ($this->editingFlightId === $flightId) {
            $this->resetForm();
        }

        session()->flash('status', 'Flight deleted.');
    }

    public function resetForm(): void
    {
        $this->editingFlightId = null;
        $this->flight_date = now()->format('Y-m-d');
        $this->flight_time = '0';
        $this->departure_time = null;
        $this->arrival_time = null;
        $this->pilot_role = null;
        $this->solo = false;
        $this->cross_country = false;
        $this->night = false;
        $this->instructor = false;
        $this->departure_airport = '';
        $this->arrival_airport = '';
        $this->aircraft_registration = '';
        $this->aircraft_type = '';
        $this->flight_type = 'training';
        $this->notes = null;
        $this->takeoffs = 0;
        $this->landings = 0;
        $this->actual_instrument = '0';
        $this->simulated_instrument = '0';
    }

    protected function rules(): array
    {
        return [
            'flight_date' => ['required', 'date'],
            'flight_time' => ['required', 'numeric', 'min:0'],
            'departure_time' => ['nullable', 'date'],
            'arrival_time' => ['nullable', 'date', 'after_or_equal:departure_time'],
            'pilot_role' => ['nullable', 'in:pic,sic,solo,dual_received,dual_given'],
            'solo' => ['boolean'],
            'cross_country' => ['boolean'],
            'night' => ['boolean'],
            'instructor' => ['boolean'],
            'departure_airport' => ['required', 'string', 'max:10'],
            'arrival_airport' => ['required', 'string', 'max:10'],
            'aircraft_registration' => ['required', 'string', 'max:20'],
            'aircraft_type' => ['required', 'string', 'max:100'],
            'flight_type' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'takeoffs' => ['required', 'integer', 'min:0'],
            'landings' => ['required', 'integer', 'min:0'],
            'actual_instrument' => ['required', 'numeric', 'min:0'],
            'simulated_instrument' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function render()
    {
        $flights = Flight::query()->latest('flight_date')->latest('created_at')->get();

        return view('livewire.flight-dashboard', [
            'flights' => $flights,
            'summary' => Flight::summaryTotals($flights),
        ])->layout('layouts.app');
    }
}