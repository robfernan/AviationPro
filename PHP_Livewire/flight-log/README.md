# Flight Log Application (PHP + Laravel + Livewire)

A comprehensive flight logging system built with Laravel and Livewire. Track all your flight details, aircraft information, and flight history with real-time interactivity.

## Overview

Flight Log is a CRUD (Create, Read, Update, Delete) web application designed for pilots, aviation enthusiasts, and flight schools to maintain accurate and detailed records of flights using modern PHP technologies.

## Core Features

- ✈️ **Create Flights** - Log new flights with detailed information
- 📖 **View Flight History** - Browse all recorded flights
- ✏️ **Edit Flight Records** - Update flight details with live validation
- 🗑️ **Delete Flights** - Remove incorrect or obsolete records
- 📊 **Flight Statistics** - View flight hours, counts, and trends
- ⚡ **Real-time Updates** - Livewire components for seamless interactions

## Flight Log Data Fields

Each flight record should contain the following information:

### Flight Information
- **Flight Date** - Date when the flight occurred
- **Flight Time** - Total duration of the flight (hours/minutes)
- **Departure Time** - When the flight started
- **Arrival Time** - When the flight ended
- **Flight Type** - Type of flight (training, personal, commercial, etc.)

### Aircraft Information
- **Aircraft Registration** - Tail number/N-number (e.g., N12345)
- **Aircraft Type** - Model of aircraft (e.g., Cessna 172, Boeing 737)
- **Manufacturer** - Aircraft manufacturer
- **Engine Type** - Single engine, twin engine, jet, etc.

### Flight Route
- **Departure Airport** - Airport code of origin (e.g., LAX)
- **Arrival Airport** - Airport code of destination (e.g., SFO)
- **Alternate Airport** - Backup landing site (if applicable)
- **Distance** - Total miles/kilometers flown
- **Route Description** - Details about the flight path

### Pilot Information
- **Pilot Name** - Name of pilot in command
- **Pilot License** - License type and number
- **Second Pilot** - Co-pilot name (if applicable)
- **Crew** - Total number of crew members

### Flight Conditions
- **Weather** - Weather conditions during flight
- **Visibility** - Visibility range
- **Ceiling** - Cloud ceiling altitude
- **Wind** - Wind speed and direction
- **Temperature** - Outside air temperature

### Flight Details
- **Purpose** - Purpose of the flight (training, cargo, passenger, etc.)
- **Passengers** - Number of passengers aboard
- **Cargo Weight** - Weight of cargo transported
- **Notes/Comments** - Additional observations and remarks
- **Landing Type** - Normal, crosswind, emergency, etc.
- **Issues Encountered** - Any mechanical or operational issues

### Maintenance & Safety
- **Pre-flight Inspection** - Status of pre-flight check
- **Issues Found** - Any mechanical issues discovered
- **Maintenance Required** - Yes/No
- **Fuel Used** - Gallons/liters of fuel consumed

## Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: Livewire 4.x + Blade Templates
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Package Manager**: Composer

## Setup Instructions

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18.0+
- PostgreSQL 13.0+
- Git

### Installation

1. Navigate to the project directory:
```bash
cd /home/rf80678/Documents/Full_stack/PHP_Livewire/flight-log
```

2. Create a new Laravel project:
```bash
composer create-project laravel/laravel . --no-interaction
```

3. Install Livewire:
```bash
composer require livewire/livewire
```

4. Copy environment file:
```bash
cp .env.example .env
php artisan key:generate
```

5. Configure database in `.env`:
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=flight_log
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

6. Create database:
```bash
createdb flight_log
```

7. Run migrations:
```bash
php artisan migrate
```

8. Install Node dependencies:
```bash
npm install
npm run dev
```

9. Start the development server:
```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## Current Status

This project has been scaffolded inside `/home/rf80678/Documents/Full_stack/PHP_Livewire/flight-log` and Livewire has been installed.

Next up is the actual Flight Log dashboard, model, migration, and CRUD behavior.

## Project Structure

```
flight-log/
├── app/
│   ├── Models/          # Flight, Aircraft, Pilot models
│   ├── Http/
│   │   └── Controllers/ # Flight controllers
│   └── Livewire/        # Livewire components
├── database/
│   ├── migrations/      # Database migrations
│   └── factories/       # Test data factories
├── resources/
│   ├── views/           # Blade templates
│   └── css/             # Tailwind CSS
├── routes/
│   └── web.php          # Web routes
├── composer.json        # PHP dependencies
└── package.json         # Node dependencies
```

## Database Schema

### Flights Table
```
- id (primary key)
- flight_date (date)
- flight_time (decimal)
- departure_time (timestamp)
- arrival_time (timestamp)
- flight_type (string)
- aircraft_id (foreign key)
- departure_airport (string)
- arrival_airport (string)
- distance (decimal)
- purpose (string)
- notes (longtext)
- created_at (timestamp)
- updated_at (timestamp)
```

### Aircraft Table
```
- id (primary key)
- registration (string) - Unique tail number
- aircraft_type (string)
- manufacturer (string)
- engine_type (string)
- created_at (timestamp)
- updated_at (timestamp)
```

## Usage Examples

### Creating a Flight
1. Navigate to "New Flight"
2. Fill in flight details with real-time validation
3. Select aircraft from dropdown
4. Submit form

### Viewing Flights
- Dashboard shows all flights
- Sort by date, aircraft, or duration
- Real-time search functionality

### Editing a Flight
1. Click "Edit" on any flight record
2. Update information with live validation
3. Save changes instantly with Livewire

### Deleting a Flight
1. Click "Delete" on flight record
2. Confirm deletion

## Key Commands

```bash
# Generate a model with migration
php artisan make:model Flight -m

# Generate a controller
php artisan make:controller FlightController --model=Flight

# Generate a Livewire component
php artisan livewire:make flight-form

# Run migrations
php artisan migrate

# Fresh migration
php artisan migrate:fresh

# Tinker shell
php artisan tinker
```

## Features to Implement

- [ ] User authentication
- [ ] Multiple user support
- [ ] Export to PDF
- [ ] Export to CSV
- [ ] Flight statistics dashboard
- [ ] Aircraft maintenance tracking
- [ ] Flight hour calculations
- [ ] Advanced search filters
- [ ] Flight logbook printable format

## Development Workflow

1. Create models and migrations
2. Build controllers
3. Create Livewire components
4. Build Blade views
5. Style with Tailwind CSS
6. Test all CRUD operations

## Testing

```bash
# Run tests
php artisan test

# Create a test
php artisan make:test FlightTest
```

## Deployment

```bash
# Optimize for production
php artisan optimize

# Build assets
npm run build

# Create symbolic link for storage
php artisan storage:link
```

## Contributing

To contribute improvements:

1. Create a feature branch
2. Make changes
3. Write tests
4. Submit pull request

## License

This project is open source and available for educational purposes.

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Livewire Documentation](https://livewire.laravel.com/)
- [Blade Templates](https://laravel.com/docs/blade)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated**: May 7, 2026
**Status**: Initial Setup Phase
**Framework**: Laravel 11 + Livewire 3
