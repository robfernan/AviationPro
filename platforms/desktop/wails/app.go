package main

import (
	"context"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (b *App) Startup(ctx context.Context) {
	b.ctx = ctx
}

// Shutdown is called when the app closes
func (b *App) Shutdown(ctx context.Context) {
}

// OpenFile opens a file save/open dialog
func (a *App) OpenFile(filter string) (string, error) {
	// This will be implemented using Wails runtime dialogs
	return "", nil
}

// SaveFile opens a file save dialog
func (a *App) SaveFile(filename string, content string) error {
	// This will be implemented using Wails runtime dialogs
	return nil
}

// GetAppVersion returns the app version
func (a *App) GetAppVersion() string {
	return "0.1.0"
}
