# Wails Desktop Build

This directory contains the Go backend for the AviationPro desktop application built with Wails.

## Setup

### Prerequisites
- Go 1.21 or later: https://golang.org/dl/
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Build Instructions

#### Development Mode
```bash
# From this directory (wails/)
wails dev
```
This runs the app with hot reload for both frontend and backend.

#### Production Build
```bash
# Build for current platform
wails build

# Build for Windows
wails build -platform windows/amd64

# Build for macOS
wails build -platform darwin/universal

# Build for Linux
wails build -platform linux/amd64
```

Output binaries will be in `build/bin/`.

## Project Structure

- `main.go` - Application entry point and Wails configuration
- `app.go` - Backend service methods available to the frontend
- `wails.json` - Wails build configuration
- `go.mod` - Go module dependencies

## Features

The backend provides:
- Window management
- File dialogs (for CSV export, import)
- System notifications
- Application lifecycle hooks

## Frontend Integration

The React frontend is built from the parent directory with `npm run build` and served from `../dist/`.

The Wails build process automatically:
1. Runs `npm run build` to create the React bundle
2. Embeds the bundle in the executable
3. Creates platform-specific installers

## Development Workflow

1. Run `npm run dev` from the parent directory for web development
2. Run `wails dev` from this directory for desktop development
3. Both can run simultaneously for rapid iteration

## Next Steps

- Add native menu bar (File, Edit, Help menus)
- Implement file dialogs for CSV import/export
- Add system notifications for alerts
- Add auto-update functionality
