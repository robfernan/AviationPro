# AviationPro — Professional Flight Planning Suite

A comprehensive aviation flight planning application built with React, TypeScript, and Tailwind CSS. Designed for pilots to plan, calculate, and manage all aspects of flight operations with professional-grade tools and calculations.

## 🚀 Features

### 📋 Flight Planner
- **Complete Flight Documentation**: Aircraft type, tail number, pilot info, fuel planning
- **Dynamic Route Planning**: Add/remove checkpoints with automatic numbering
- **Advanced Flight Calculations**: Distance, course, ground speed, time, and fuel consumption
- **Comprehensive Instructions**: 8-section detailed guide covering all aspects of flight planning
- **VOR Navigation Setup**: Frequency, radial, and identifier configuration
- **Export Options**: Print and download flight plans with professional formatting
- **Real-time Totals**: Automatic calculation of total distance, time, and fuel
- **Manual vs Digital Methods**: Support for both CX-6 and manual E6B calculations

### 🧮 CX-6 Flight Computer
- **Wind Triangle Calculations**: Headwind, crosswind, and tailwind components
- **Fuel Calculations**: Trip fuel, reserve fuel, and endurance times
- **Time-Speed-Distance**: TAS, GS, distance, and time calculations
- **Pressure Altitude**: Field elevation to pressure altitude conversion
- **Density Altitude**: Performance calculations for high-altitude airports
- **Multiple Calculator Modes**: Wind triangle, TAS, fuel consumption, time-speed-distance

### 🌤️ Weather Calculator
- **Density Altitude**: Pressure altitude and density altitude calculations
- **Cloud Base**: Temperature/dew point cloud base approximations
- **Performance Warnings**: Color-coded alerts for high density altitude conditions
- **ISA Deviations**: Temperature variance from standard atmosphere
- **Units Support**: Celsius for temperature, proper aviation units
- **Tabbed Interface**: Easy switching between density altitude and cloud base calculations

### ⚖️ Weight & Balance
- **Aircraft Loading**: Pilot, passengers, fuel, and cargo weights
- **Center of Gravity**: CG envelope calculations and limits
- **Moment Calculations**: Weight × arm calculations
- **Safety Alerts**: Out-of-limits warnings and recommendations

### 🧭 Navigation Tools
- **Distance Calculations**: Great circle and rhumb line distances
- **Bearing Calculations**: True and magnetic bearings
- **Unit Conversions**: Nautical miles, statute miles, kilometers
- **Coordinate Conversions**: Lat/lon to various formats
- **Multiple Calculation Methods**: Haversine formula for accurate results
- **Aviation Weather Services**: Direct links to official weather sources
- **Time Zone Converter**: UTC to local time conversions for international flights

### 📝 Flight Logs
- **Digital Logbook**: Complete flight logging with local storage
- **Flight Details**: Date, aircraft, route, times, and conditions
- **Automatic Calculations**: Block time, flight time, fuel used
- **Export Capabilities**: Download flight logs for records
- **Persistent Storage**: Data saved locally for future sessions

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks
- **Data Persistence**: Local storage for flight logs
- **Development**: Hot module replacement, fast refresh

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ recommended
- npm or yarn package manager

### Installation

```powershell
# Clone or navigate to project directory
cd 'C:\Users\User\Documents\Bolt_ai\Aviation'

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Application
Open [http://localhost:5173](http://localhost:5173) in your browser

## 📦 Build & Deployment

```powershell
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── FlightPlanForm.tsx      # Main flight planning interface with comprehensive instructions
│   ├── CX6Calculator.tsx       # E6B flight computer with multiple calculators
│   ├── WeatherCalculator.tsx   # Weather tools (density altitude, cloud base)
│   ├── WeightBalanceCalculator.tsx # Weight & balance calculations
│   ├── NavigationTools.tsx     # Navigation calculations, weather services, and time zone converter
│   ├── FlightLogs.tsx          # Digital flight logging system
│   ├── PressureAltitudeCalculator.tsx # Additional weather calculations
│   └── CloudBaseCalculator.tsx # Standalone cloud base calculator
├── App.tsx                     # Main application with dark mode support
└── main.tsx                    # Application entry point
```

### Key Components

#### FlightPlanForm
- Manages flight planning with dynamic checkpoints
- Calculates totals for distance, time, and fuel
- Supports export to print/download formats
- Comprehensive 8-section user guide
- VOR navigation setup and configuration

#### WeatherCalculator
- Unified component with tabbed interface
- Density altitude calculations in Celsius
- Cloud base approximations
- Performance impact warnings

#### CX6Calculator
- Traditional E6B flight computer interface
- Wind triangle and fuel calculations
- Aviation-specific unit conversions
- Multiple calculation modes in one interface

## 🎯 Usage Examples

### Flight Planning
1. Enter aircraft information (type, tail number, pilot)
2. Set departure and destination airports
3. Add checkpoints between departure and destination
4. Enter altitude, course, distance, and fuel for each leg
5. Configure VOR navigation for each checkpoint
6. Review automatic totals and export flight plan
7. Use comprehensive instructions for guidance

### Weather Calculations
1. Switch between Density Altitude and Cloud Base tabs
2. Enter airport elevation, temperature (°C), altimeter setting
3. View pressure altitude, density altitude, and ISA deviations
4. Check performance impact warnings

### Navigation Tools
1. Use distance and bearing calculators for flight planning
2. Convert between different units (nautical miles, statute miles, kilometers)
3. Access official aviation weather services for current conditions
4. Convert between UTC and local time for international flights
5. Use aviation-specific reference information and quick calculations

## 🔍 Troubleshooting

### Common Issues
- **Vite 404 Error**: Ensure `index.html` exists at project root
- **Build Failures**: Run `npm install` to restore dependencies
- **Port Conflicts**: Vite runs on port 5173 by default
- **Dark Mode Issues**: Ensure Tailwind dark mode is configured

### Development Tips
- Use browser dev tools for debugging
- Check console for TypeScript errors
- Dark mode toggle available in header
- All calculations update in real-time
- Hot module replacement for fast development

## 🚀 Professional Enhancements

### High Priority Additions
- **Fuel Planning Calculator**: Trip fuel, reserve fuel, fuel stops with airport search
- **Crosswind Calculator**: Runway crosswind component analysis with wind direction
- **Aircraft Performance Calculator**: Takeoff/landing distance calculations
- **METAR/TAF Integration**: Real weather data integration
- **Airport Database**: Airport info, frequencies, services, and charts

### Medium Priority Features
- **Time Zone Converter**: UTC/local time conversions for international flights
- **VFR/IFR Minimums Reference**: Quick reference for minimums by aircraft category
- **Flight Plan Filing**: Digital flight plan submission to ATC
- **Route Optimization**: Automatic route suggestions based on weather and winds
- **Aircraft Profile Management**: Save/load aircraft configurations

### Integration Opportunities
- **ForeFlight Web**: Direct links to ForeFlight (already implemented)
- **Garmin Pilot**: Direct links to Garmin Pilot (already implemented)
- **FlightAware**: Flight tracking and delay information
- **Aviation Weather**: Real-time weather data integration
- **NOTAMs Integration**: Notice to Air Missions display

### UI/UX Improvements
- **Mobile Responsiveness**: Optimize for tablet use in cockpit
- **Keyboard Shortcuts**: Quick access to common functions
- **Data Import/Export**: CSV/JSON import for aircraft data
- **Print Templates**: Customizable print formats for different aircraft
- **Offline Mode**: Core functionality without internet connection

## 📄 License & Contact

This project is designed for flight simulation and training purposes. Always consult official aviation publications and current weather for actual flight planning.

---

**Built with ❤️ for aviation professionals and enthusiasts**
