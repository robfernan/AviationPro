package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type WeatherBundle struct {
	Metar string `json:"metar"`
	Taf   string `json:"taf"`
	Error string `json:"error,omitempty"`
}

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

func fetchWeatherText(url string, field string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var payload []map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return "", err
	}

	if len(payload) == 0 {
		return "", fmt.Errorf("empty response")
	}

	if value, ok := payload[0][field].(string); ok && value != "" {
		return value, nil
	}

	return "", fmt.Errorf("missing %s", field)
}

// GetWeatherBundle fetches both METAR and TAF and returns a compact JSON bundle.
func (a *App) GetWeatherBundle(icao string) string {
	icao = strings.ToUpper(strings.TrimSpace(icao))
	if len(icao) != 4 {
		bundle, _ := json.Marshal(WeatherBundle{Error: "INVALID ICAO"})
		return string(bundle)
	}

	metarURL := fmt.Sprintf("https://aviationweather.gov/api/data/metar?ids=%s&format=json", icao)
	tafURL := fmt.Sprintf("https://aviationweather.gov/api/data/taf?ids=%s&format=json", icao)

	metar, metarErr := fetchWeatherText(metarURL, "rawOb")
	taf, tafErr := fetchWeatherText(tafURL, "rawTAF")

	bundle := WeatherBundle{Metar: metar, Taf: taf}
	if metarErr != nil && tafErr != nil {
		bundle.Error = "OFFLINE"
	}

	encoded, err := json.Marshal(bundle)
	if err != nil {
		return `{"error":"SERIALIZE_ERROR"}`
	}

	return string(encoded)
}

// Shutdown is called when the app closes
func (a *App) Shutdown(ctx context.Context) {}