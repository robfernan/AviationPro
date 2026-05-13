json.extract! flight, :id, :flight_date, :flight_time, :departure_time, :arrival_time, :pilot_role, :solo, :cross_country, :night, :instructor, :departure_airport, :arrival_airport, :aircraft_registration, :aircraft_type, :flight_type, :notes, :takeoffs, :landings, :actual_instrument, :simulated_instrument, :created_at, :updated_at
json.url flight_url(flight, format: :json)
