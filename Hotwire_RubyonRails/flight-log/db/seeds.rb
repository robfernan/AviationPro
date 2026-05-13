# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

if Flight.count.zero?
	Flight.create!(
		flight_date: Date.new(2026, 5, 2),
		departure_time: Time.zone.parse("2026-05-02 08:00"),
		arrival_time: Time.zone.parse("2026-05-02 09:35"),
		flight_time: 1.6,
		pilot_role: "pic",
		solo: true,
		cross_country: true,
		night: false,
		instructor: false,
		departure_airport: "KSEE",
		arrival_airport: "KSAN",
		aircraft_registration: "N123FL",
		aircraft_type: "Cessna 172",
		flight_type: "cross country",
		notes: "Short VFR hop with a diversion practice on the way back.",
		takeoffs: 2,
		landings: 2,
		actual_instrument: 0,
		simulated_instrument: 0
	)

	Flight.create!(
		flight_date: Date.new(2026, 5, 4),
		departure_time: Time.zone.parse("2026-05-04 19:20"),
		arrival_time: Time.zone.parse("2026-05-04 20:35"),
		flight_time: 1.25,
		pilot_role: "solo",
		solo: true,
		cross_country: false,
		night: true,
		instructor: false,
		departure_airport: "KMYF",
		arrival_airport: "KMYF",
		aircraft_registration: "N817CS",
		aircraft_type: "Cessna 172",
		flight_type: "training",
		notes: "Night pattern work and a few full-stop landings.",
		takeoffs: 4,
		landings: 4,
		actual_instrument: 0,
		simulated_instrument: 0.3
	)

	Flight.create!(
		flight_date: Date.new(2026, 5, 6),
		departure_time: Time.zone.parse("2026-05-06 13:10"),
		arrival_time: Time.zone.parse("2026-05-06 14:45"),
		flight_time: 1.5,
		pilot_role: "dual_received",
		solo: false,
		cross_country: false,
		night: false,
		instructor: true,
		departure_airport: "KCRQ",
		arrival_airport: "KCRQ",
		aircraft_registration: "N442TR",
		aircraft_type: "Piper Archer",
		flight_type: "training",
		notes: "Steep turns, slow flight, and emergency procedures with an instructor.",
		takeoffs: 3,
		landings: 3,
		actual_instrument: 0.4,
		simulated_instrument: 0.2
	)
end
