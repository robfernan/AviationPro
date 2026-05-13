<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Log</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-white text-slate-800 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-6">
        <header class="mb-8 rounded-3xl border border-teal-100 bg-teal-50 p-6 shadow-sm">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.35em] text-orange-500">Laravel + Livewire</p>
                    <h1 class="mt-2 text-3xl font-black tracking-tight text-teal-700">Flight Log</h1>
                    <p class="mt-2 max-w-2xl text-sm text-slate-600">A cleaner logbook for tracking PIC, solo, cross-country, night, and instrument time.</p>
                </div>
                <div class="rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm text-slate-700">
                    PHP Livewire version — teal/orange theme
                </div>
            </div>
        </header>

        {{ $slot }}
    </div>

    @livewireScripts
</body>
</html>