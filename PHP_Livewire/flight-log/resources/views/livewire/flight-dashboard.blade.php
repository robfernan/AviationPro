<div class="space-y-8">
    @if (session('status'))
        <div class="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-teal-700">
            {{ session('status') }}
        </div>
    @endif

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-3xl border border-teal-100 bg-white p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Total Time</p>
            <p class="mt-3 text-4xl font-black text-teal-700">{{ $summary['total_time'] }}</p>
        </div>
        <div class="rounded-3xl border border-teal-100 bg-white p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">PIC</p>
            <p class="mt-3 text-4xl font-black text-teal-700">{{ $summary['pic_time'] }}</p>
        </div>
        <div class="rounded-3xl border border-teal-100 bg-white p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Solo</p>
            <p class="mt-3 text-4xl font-black text-teal-700">{{ $summary['solo_time'] }}</p>
        </div>
        <div class="rounded-3xl border border-teal-100 bg-white p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Night</p>
            <p class="mt-3 text-4xl font-black text-teal-700">{{ $summary['night_time'] }}</p>
        </div>
    </section>

    <section class="grid gap-8 xl:grid-cols-[1.05fr_1.25fr]">
        <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-sky-400">Flight entry</p>
                    <h2 class="mt-2 text-2xl font-bold">{{ $editingFlightId ? 'Edit flight' : 'Log a flight' }}</h2>
                </div>
                @if ($editingFlightId)
                    <button type="button" wire:click="resetForm" class="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-slate-700 hover:border-gray-300">Cancel edit</button>
                @endif
            </div>

            <form wire:submit.prevent="saveFlight" class="mt-6 space-y-4">
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Flight date</span>
                        <input type="date" wire:model="flight_date" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800" />
                        @error('flight_date') <span class="text-sm text-red-300">{{ $message }}</span> @enderror
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Flight time</span>
                        <input type="number" step="0.1" wire:model="flight_time" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800" />
                        @error('flight_time') <span class="text-sm text-red-300">{{ $message }}</span> @enderror
                    </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Departure airport</span>
                        <input type="text" wire:model="departure_airport" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800" placeholder="KSEE" />
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Arrival airport</span>
                        <input type="text" wire:model="arrival_airport" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800" placeholder="KSAN" />
                    </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Aircraft registration</span>
                        <input type="text" wire:model="aircraft_registration" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800" placeholder="N123FL" />
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Aircraft type</span>
                        <input type="text" wire:model="aircraft_type" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800" placeholder="Cessna 172" />
                    </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Pilot role</span>
                        <select wire:model="pilot_role" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800">
                            <option value="">Unspecified</option>
                            <option value="pic">PIC</option>
                            <option value="sic">SIC</option>
                            <option value="solo">Solo</option>
                            <option value="dual_received">Dual received</option>
                            <option value="dual_given">Dual given</option>
                        </select>
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-600">Flight type</span>
                        <select wire:model="flight_type" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-slate-800">
                            <option value="training">training</option>
                            <option value="cross country">cross country</option>
                            <option value="local">local</option>
                            <option value="checkride">checkride</option>
                            <option value="ferry">ferry</option>
                            <option value="other">other</option>
                        </select>
                    </label>
                </div>

                <div class="grid gap-3 md:grid-cols-4">
                    <label class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <input type="checkbox" wire:model="solo" /> Solo
                    </label>
                    <label class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <input type="checkbox" wire:model="cross_country" /> Cross-country
                    </label>
                    <label class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <input type="checkbox" wire:model="night" /> Night
                    </label>
                    <label class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <input type="checkbox" wire:model="instructor" /> Instructor
                    </label>
                </div>

                <div class="grid gap-4 md:grid-cols-4">
                    <label class="space-y-2">
                        <span class="text-sm text-slate-300">Takeoffs</span>
                        <input type="number" wire:model="takeoffs" class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-300">Landings</span>
                        <input type="number" wire:model="landings" class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-300">Actual instrument</span>
                        <input type="number" step="0.1" wire:model="actual_instrument" class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                    </label>
                    <label class="space-y-2">
                        <span class="text-sm text-slate-300">Simulated instrument</span>
                        <input type="number" step="0.1" wire:model="simulated_instrument" class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
                    </label>
                </div>

                <label class="space-y-2 block">
                    <span class="text-sm text-slate-300">Notes</span>
                    <textarea wire:model="notes" rows="4" class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" placeholder="Weather, maneuvers, instructor notes..."></textarea>
                </label>

                <div class="flex items-center gap-3">
                    <button type="submit" class="rounded-2xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-500">{{ $editingFlightId ? 'Update flight' : 'Save flight' }}</button>
                    <button type="button" wire:click="resetForm" class="rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-slate-700 hover:border-gray-300">Clear form</button>
                </div>
            </form>
        </div>
        <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-orange-500">Entries</p>
                    <h2 class="mt-2 text-2xl font-bold">Flight log</h2>
                </div>
                <p class="text-sm text-slate-400">{{ $flights->count() }} total</p>
            </div>

            <div class="mt-6 overflow-hidden rounded-3xl border border-gray-100">
                <table class="min-w-full divide-y divide-gray-100 text-sm">
                    <thead class="bg-teal-50 text-left text-teal-700">
                        <tr>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">Route</th>
                            <th class="px-4 py-3">Aircraft</th>
                            <th class="px-4 py-3">Time</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        @forelse ($flights as $flight)
                            <tr>
                                <td class="px-4 py-3">{{ optional($flight->flight_date)->format('M d, Y') }}</td>
                                <td class="px-4 py-3">
                                    <div class="font-semibold">{{ $flight->routeLabel() }}</div>
                                    <div class="text-slate-400">{{ $flight->flight_type }}</div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-semibold">{{ $flight->aircraft_registration }}</div>
                                    <div class="text-slate-400">{{ $flight->aircraft_type }}</div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-semibold">{{ number_format($flight->totalTimeHours(), 1) }} hrs</div>
                                    <div class="text-slate-400">{{ number_format($flight->instrumentTimeHours(), 1) }} instr.</div>
                                </td>
                                <td class="px-4 py-3">{{ $flight->pilotRoleLabel() }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex flex-wrap gap-2">
                                        <button type="button" wire:click="editFlight({{ $flight->id }})" class="rounded-xl border border-gray-200 px-3 py-2 text-xs text-teal-700 hover:border-gray-300">Edit</button>
                                        <button type="button" wire:click="deleteFlight({{ $flight->id }})" class="rounded-xl border border-orange-300 px-3 py-2 text-xs text-orange-600 hover:border-orange-400">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td class="px-4 py-8 text-center text-slate-400" colspan="6">No flights logged yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>