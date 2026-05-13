class CreateFlights < ActiveRecord::Migration[7.2]
  def change
    create_table :flights do |t|
      t.date :flight_date
      t.decimal :flight_time, precision: 6, scale: 2, null: false, default: 0
      t.datetime :departure_time
      t.datetime :arrival_time
      t.string :pilot_role
      t.boolean :solo, null: false, default: false
      t.boolean :cross_country, null: false, default: false
      t.boolean :night, null: false, default: false
      t.boolean :instructor, null: false, default: false
      t.string :departure_airport
      t.string :arrival_airport
      t.string :aircraft_registration
      t.string :aircraft_type
      t.string :flight_type
      t.text :notes
      t.integer :takeoffs, null: false, default: 0
      t.integer :landings, null: false, default: 0
      t.decimal :actual_instrument, precision: 6, scale: 2, null: false, default: 0
      t.decimal :simulated_instrument, precision: 6, scale: 2, null: false, default: 0

      t.timestamps
    end
  end
end
