module FlightsHelper
	def format_hours(value)
		number_with_precision(value.to_f, precision: 1, strip_insignificant_zeros: true)
	end

	def flight_role_badge_class(flight)
		case flight.pilot_role
		when "pic"
			"badge-pic"
		when "sic"
			"badge-sic"
		when "solo"
			"badge-solo"
		when "dual_received", "dual_given"
			"badge-dual"
		else
			"badge-neutral"
		end
	end
end
