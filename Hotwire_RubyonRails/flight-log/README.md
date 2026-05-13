# Flight Log Application

A comprehensive flight logging system built with Ruby on Rails and Hotwire. Track all your flight details, aircraft information, and flight history in one centralized location.
## Overview

Flight Log is a CRUD (Create, Read, Update, Delete) web application designed for pilots, aviation enthusiasts, and flight schools to maintain accurate and detailed records of flights.

## Core Features

- ✈️ **Create Flights** - Log new flights with detailed information
- 📖 **View Flight History** - Browse all recorded flights
- ✏️ **Edit Flight Records** - Update flight details to correct errors
- 🗑️ **Delete Flights** - Remove incorrect or obsolete records
- 📊 **Flight Statistics** - View flight hours, counts, and trends

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

## Flight Hour Categories

To make the logbook actually useful, each flight should support hour totals by category.

### Core Totals
- **Total Time** - All logged flight time
- **PIC Time** - Pilot in command time
- **SIC Time** - Second in command time
- **Dual Received** - Time with an instructor
- **Dual Given** - Instruction time given to another pilot
- **Solo Time** - Time flown alone
- **Cross Country Time** - Time on cross-country flights
- **Night Time** - Time logged at night
- **Night Solo** - Solo time flown at night
- **Solo Cross Country** - Solo cross-country time

### Additional Useful Totals
- **Day Time** - Time flown during the day
- **Instrument Time** - Actual or simulated instrument time
- **Actual Instrument** - Time in actual IMC
- **Simulated Instrument** - Time under view-limiting device
- **Takeoffs** - Number of takeoffs
- **Landings** - Number of landings
- **Approaches** - Number of instrument approaches
- **Multi-Engine Time** - If applicable
- **Single-Engine Time** - If applicable

### Optional Totals to Consider
- **IFR Time** - Time flown under IFR
- **VFR Time** - Time flown under VFR
- **Mountain Time** - Mountain flying experience
- **Tailwheel Time** - Tailwheel aircraft time
- **Complex Time** - Complex aircraft time
- **High Performance Time** - High-performance aircraft time
- **Seaplane Time** - Amphibious or seaplane time

## How Totals Should Work

The app should let you enter the raw flight details once, then calculate the totals automatically based on the flight type, time of day, and pilot role.

Example calculations:
- If a flight is logged as solo, it contributes to **Solo Time** and possibly **Night Solo** or **Solo Cross Country**.
- If the flight is cross-country, it contributes to **Cross Country Time**.
- If the flight happened after sunset, it contributes to **Night Time**.
- If the flight was flown with an instructor, it contributes to **Dual Received**.
- If the flight was flown as pilot in command, it contributes to **PIC Time**.

## Suggested Flight Record Fields For Hour Tracking

- **Total Flight Time**
- **Pilot Role** - PIC, SIC, solo, dual received, dual given
- **Flight Conditions** - day, night, instrument, simulated instrument, actual instrument
- **Flight Type** - local, cross-country, training, checkride
- **Cross Country Flag** - Yes/No
- **Solo Flag** - Yes/No
- **Night Flag** - Yes/No
- **Instruction Flag** - Yes/No
- **Aircraft Class** - single-engine, multi-engine, helicopter, etc.

## Tech Stack

- **Backend**: Ruby on Rails 7.2.x
- **Frontend**: Hotwire (Turbo + Stimulus)
- **Database**: PostgreSQL
- **Styling**: Custom Tailwind-inspired CSS
- **Authentication**: Rails built-in (optional)

## Setup Instructions

### Prerequisites
- Ruby 3.1.0+
- Node.js 18.0+
- PostgreSQL 13.0+
- Git

### Installation

1. Navigate to the project directory:
```bash
cd /home/rf80678/Documents/Full_stack/Hotwire_RubyonRails/flight-log
```

2. Create a new Rails application:
```bash
rails new . --database=postgresql --skip-test
```

3. Install dependencies:
```bash
bundle install
npm install
```

4. Setup the database:
```bash
rails db:create
rails db:migrate
```

5. Start the development server:
```bash
./bin/dev
```

Visit `http://localhost:3000` in your browser.

## Current Status

This version is built and running with:

- A flight dashboard with summary totals
- CRUD screens for flight records
- Sample seed data
- Hotwire entrypoints wired correctly
- Hour categories for solo, cross-country, night, PIC, SIC, and instrument time

## Notes

This app is intentionally simpler than a paper Cessna logbook to make logging and reviewing flight time faster.

## Project Structure

```
flight-log/
├── app/
│   ├── models/          # Flight, Aircraft, Pilot models
│   ├── controllers/     # FlightsController
│   ├── views/           # HTML templates for flights
│   └── assets/          # CSS and JavaScript
├── db/
│   ├── migrate/         # Database migrations
│   └── schema.rb        # Database schema
├── config/
│   └── routes.rb        # API routes
├── Gemfile              # Ruby dependencies
└── package.json         # Node dependencies
```

## Database Schema

### Flights Table
```
- id (primary key)
- flight_date (date)
- flight_time (decimal)
- departure_time (datetime)
- arrival_time (datetime)
- flight_type (string)
- aircraft_id (foreign key)
- departure_airport (string)
- arrival_airport (string)
- distance (decimal)
- purpose (string)
- notes (text)
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
1. Click "New Flight" button
2. Fill in flight details
3. Select aircraft from dropdown
4. Save flight record

### Viewing Flights
- Dashboard shows all flights
- Sort by date, aircraft, or duration
- Search flights by airport or date range

### Editing a Flight
1. Click "Edit" on any flight record
2. Update the information
3. Save changes

### Deleting a Flight
1. Click "Delete" on flight record
2. Confirm deletion

## Features to Implement

- [ ] Authentication and user accounts
- [ ] Multiple user support with flight sharing
- [ ] Export to PDF
- [ ] Export to CSV
- [ ] Flight statistics dashboard
- [ ] Aircraft maintenance tracking
- [ ] Flight hour calculations
- [ ] Search and filter functionality
- [ ] Flight logbook printable format

## Development Workflow

1. Create models and migrations
2. Build RESTful controllers
3. Create views with Hotwire
4. Add validation and error handling
5. Style with CSS
6. Test CRUD operations

## Commands

```bash
# Create a new model
rails generate model Flight

# Create a migration
rails generate migration CreateFlights

# Run migrations
rails db:migrate

# Start Rails console
rails console

# View routes
rails routes
```

## Contributing

To contribute improvements to this flight log system:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

This project is open source and available for educational purposes.

## Resources

- [Ruby on Rails Documentation](https://guides.rubyonrails.org/)
- [Hotwire Documentation](https://hotwired.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FAA Flight Time Records](https://www.faa.gov/)

---

**Last Updated**: May 7, 2026
**Status**: Initial Setup Phase
