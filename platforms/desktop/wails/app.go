package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Startup is called when the app starts.
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// GetWeather fetches METAR data from AviationWeather.gov to bypass CORS
func (a *App) GetWeather(icao string) string {
	icao = strings.ToUpper(strings.TrimSpace(icao))
	if len(icao) != 4 {
		return "INVALID ICAO"
	}

	url := fmt.Sprintf("https://aviationweather.gov/api/data/metar?ids=%s", icao)
	
	resp, err := http.Get(url)
	if err != nil {
		return "OFFLINE"
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "READ_ERROR"
	}

	return string(body)
}

// Shutdown is called when the app closes
func (a *App) Shutdown(ctx context.Context) {}