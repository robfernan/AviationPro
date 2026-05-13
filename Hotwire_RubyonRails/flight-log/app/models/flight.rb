class Flight < ApplicationRecord
	PILOT_ROLE_LABELS = {
		"pic" => "PIC",
		"sic" => "SIC",
		"solo" => "Solo",
		"dual_received" => "Dual Received",
		"dual_given" => "Dual Given"
	}.freeze

	validates :flight_date, :flight_time, :departure_airport, :arrival_airport, :aircraft_registration, :aircraft_type, :flight_type, presence: true
	validates :flight_time, :actual_instrument, :simulated_instrument, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
	validates :takeoffs, :landings, numericality: { greater_than_or_equal_to: 0, only_integer: true }, allow_nil: true
	validates :pilot_role, inclusion: { in: PILOT_ROLE_LABELS.keys }, allow_blank: true

	before_validation :normalize_fields

	def pilot_role_label
		PILOT_ROLE_LABELS[pilot_role] || "Unspecified"
	end

	def route_label
		[departure_airport, arrival_airport].compact.join(" → ")
	end

	def total_time_hours
		flight_time.to_f
	end

	def pic_time_hours
		pilot_role == "pic" ? total_time_hours : 0.0
	end

	def sic_time_hours
		pilot_role == "sic" ? total_time_hours : 0.0
	end

	def solo_time_hours
		solo? ? total_time_hours : 0.0
	end

	def dual_received_time_hours
		pilot_role == "dual_received" || instructor? ? total_time_hours : 0.0
	end

	def dual_given_time_hours
		pilot_role == "dual_given" ? total_time_hours : 0.0
	end

	def cross_country_time_hours
		cross_country? ? total_time_hours : 0.0
	end

	def night_time_hours
		night? ? total_time_hours : 0.0
	end

	def day_time_hours
		night? ? 0.0 : total_time_hours
	end

	def night_solo_time_hours
		night? && solo? ? total_time_hours : 0.0
	end

	def solo_cross_country_time_hours
		solo? && cross_country? ? total_time_hours : 0.0
	end

	def instrument_time_hours
		actual_instrument.to_f + simulated_instrument.to_f
	end

	def self.summary_totals(relation = all)
		flights = relation.to_a

		{
			total_time: flights.sum(&:total_time_hours),
			pic_time: flights.sum(&:pic_time_hours),
			sic_time: flights.sum(&:sic_time_hours),
			solo_time: flights.sum(&:solo_time_hours),
			dual_received_time: flights.sum(&:dual_received_time_hours),
			dual_given_time: flights.sum(&:dual_given_time_hours),
			cross_country_time: flights.sum(&:cross_country_time_hours),
			night_time: flights.sum(&:night_time_hours),
			day_time: flights.sum(&:day_time_hours),
			night_solo_time: flights.sum(&:night_solo_time_hours),
			solo_cross_country_time: flights.sum(&:solo_cross_country_time_hours),
			instrument_time: flights.sum(&:instrument_time_hours),
			takeoffs: flights.sum { |flight| flight.takeoffs.to_i },
			landings: flights.sum { |flight| flight.landings.to_i }
		}
	end

	private

	def normalize_fields
		self.pilot_role = pilot_role.to_s.strip.downcase.presence
		self.departure_airport = departure_airport.to_s.strip.upcase if departure_airport.present?
		self.arrival_airport = arrival_airport.to_s.strip.upcase if arrival_airport.present?
		self.aircraft_registration = aircraft_registration.to_s.strip.upcase if aircraft_registration.present?
		self.aircraft_type = aircraft_type.to_s.strip if aircraft_type.present?
		self.flight_type = flight_type.to_s.strip.downcase if flight_type.present?
	end
end
