WASP Flight Log Prototype
=========================

This is a lightweight client-side prototype of the Flight Log using a WASP-style layout (left navigation) and a distinct violet/yellow color palette so it doesn't share styling with the Rails or Laravel apps.

Files:
- `index.html` — main prototype page, Tailwind CDN used for convenience.
- `app.js` — main ES module that wires the UI and imports helpers.
- `storage.js` — localStorage helpers (`load`, `save`, `nextId`).
- `csv.js` — CSV import/export helpers.

There are now a few modules to keep the prototype modular and closer to a proper front-end app.

How to run:

Open `index.html` in a browser, or run a simple static server:

```bash
cd WASP/flight-log
python3 -m http.server 9000
# then open http://127.0.0.1:9000
```

Features:
- Different layout: left sidebar navigation, summary chips in header, form + table split layout.
- Different color palette: violet (primary) + yellow (accent).
- Client-side persistence via `localStorage`.
- CSV export and import (`Export CSV` and `Import CSV` buttons in the header).

Next steps:
- Add CSV import/export, more flight fields, and sync to a backend if you want a full-stack WASP implementation.
# Flight Log Application (WASP)

A full-stack flight logging system built with WASP - the modern full-stack web framework. Track all your flight details, aircraft information, and flight history with a seamless full-stack experience.

## Overview

Flight Log is a CRUD (Create, Read, Update, Delete) web application designed for pilots, aviation enthusiasts, and flight schools to maintain accurate and detailed records of flights. Built with WASP for minimal boilerplate and maximum productivity.

## Core Features

- ✈️ **Create Flights** - Log new flights with detailed information
- 📖 **View Flight History** - Browse all recorded flights with modern UI
- ✏️ **Edit Flight Records** - Update flight details with instant feedback
- 🗑️ **Delete Flights** - Remove incorrect or obsolete records
- 📊 **Flight Statistics** - View flight hours, counts, and trends
- 🔐 **Built-in Authentication** - User accounts and authorization
- ⚡ **Real-time Updates** - React front-end with instant updates

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

- **Frontend**: React 18.x
- **Backend**: Node.js + Express (via WASP)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Package Manager**: npm/yarn
- **Framework**: WASP (Wasp Language)

## Setup Instructions

### Prerequisites
- Node.js 18.0+
- Bun (for faster package management)
- PostgreSQL 13.0+
- Git
- WASP CLI installed globally

### Installation

1. Navigate to the project directory:
```bash
cd /home/rf80678/Documents/Full_stack/WASP/flight-log
```

2. Create a new WASP project:
```bash
wasp new flight-log .
```

3. Or initialize an existing WASP project:
```bash
wasp start
```

4. Install dependencies:
```bash
npm install
# or
bun install
```

5. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

6. Setup the database:
```bash
wasp db migrate
```

7. Start the development server:
```bash
wasp start
```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
flight-log/
├── wasp/
│   └── flight-log.wasp      # WASP configuration
├── src/
│   ├── client/              # React components
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── assets/          # Static files
│   ├── server/              # Node.js backend
│   │   ├── actions/         # Server actions
│   │   ├── queries/         # Server queries
│   │   └── routes/          # API routes
│   └── shared/              # Shared types and utils
├── wasp.db                  # Local database
├── .env                     # Environment variables
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## WASP Configuration (wasp.db)

```wasp
app flight-log {
  title: "Flight Log"
  wasp: {
    version: "^0.14.0"
  }
  client: {
    rootComponent: import App from "@client/App"
  }
  auth: {
    userEntity: User
    methods: {
      email: {}
    }
  }
}

entity User {=psl
  id Int @id @default(autoincrement())
  email String @unique
  password String
  flights Flight[]
  aircraft Aircraft[]
  createdAt DateTime @default(now())
psl=}

entity Flight {=psl
  id Int @id @default(autoincrement())
  flightDate DateTime
  flightTime Decimal
  departureTime DateTime
  arrivalTime DateTime
  flightType String
  aircraft Aircraft @relation(fields: [aircraftId], references: [id])
  aircraftId Int
  departureAirport String
  arrivalAirport String
  distance Decimal
  purpose String
  notes String?
  user User @relation(fields: [userId], references: [id])
  userId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
psl=}

entity Aircraft {=psl
  id Int @id @default(autoincrement())
  registration String @unique
  aircraftType String
  manufacturer String
  engineType String
  flights Flight[]
  user User @relation(fields: [userId], references: [id])
  userId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
psl=}
```

## Database Schema

### Users Table (auto-generated by WASP)
```
- id (primary key)
- email (unique)
- password (hashed)
- createdAt (timestamp)
```

### Flights Table
```
- id (primary key)
- flightDate (datetime)
- flightTime (decimal)
- departureTime (datetime)
- arrivalTime (datetime)
- flightType (string)
- aircraftId (foreign key)
- departureAirport (string)
- arrivalAirport (string)
- distance (decimal)
- purpose (string)
- notes (text)
- userId (foreign key)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Aircraft Table
```
- id (primary key)
- registration (string) - Unique tail number
- aircraftType (string)
- manufacturer (string)
- engineType (string)
- userId (foreign key)
- createdAt (timestamp)
- updatedAt (timestamp)
```

## Usage Examples

### Creating a Flight
1. Log in to your account
2. Navigate to "New Flight"
3. Fill in flight details
4. Select aircraft from your aircraft list
5. Submit and view in flight list instantly

### Viewing Flights
- Dashboard shows all your flights
- Sort by date, aircraft, or duration
- Search functionality
- Filter by flight type

### Editing a Flight
1. Click "Edit" on any flight record
2. Update information
3. Save changes with instant UI update

### Deleting a Flight
1. Click "Delete" on flight record
2. Confirm deletion
3. Removed from list immediately

## Key Commands

```bash
# Start development server
wasp start

# Build for production
wasp build

# Run database migrations
wasp db migrate

# Access database shell
wasp db execute

# Generate Prisma client
wasp db push

# Deploy to Wasp Cloud
wasp deploy
```

## Features to Implement

- [ ] Flight statistics dashboard with charts
- [ ] Aircraft maintenance tracking
- [ ] Flight hour calculations and totals
- [ ] Advanced search and filters
- [ ] Export to PDF
- [ ] Export to CSV
- [ ] Share flight logs with others
- [ ] Flight logbook printable format
- [ ] Notifications and reminders

## Development Workflow

1. Define entities in `wasp.db`
2. Create server queries and actions
3. Build React components for UI
4. Connect frontend to backend
5. Test all CRUD operations
6. Deploy to Wasp Cloud

## Authentication

WASP provides built-in authentication:

```typescript
// Protected page example
export const flightsPage = (props) => <FlightsPage {...props} />;

flightsPage.authRequired = true;
```

## Deployment

```bash
# Deploy to Wasp Cloud
wasp deploy

# Build Docker image
wasp build
docker build -t flight-log .
docker run -p 3000:3000 flight-log
```

## Contributing

To contribute improvements:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

This project is open source and available for educational purposes.

## Resources

- [WASP Documentation](https://wasp-lang.dev/docs/)
- [React Documentation](https://react.dev/)
- [Prisma ORM](https://www.prisma.io/)
- [Node.js & Express](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

## Troubleshooting

### Database Connection Issues
```bash
wasp db reset
wasp db push
```

### Port Already in Use
```bash
wasp start -- --port 3001
```

### Dependencies Issues
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

**Last Updated**: May 7, 2026
**Status**: Initial Setup Phase
**Framework**: WASP + React + Node.js
**Database**: PostgreSQL with Prisma ORM
