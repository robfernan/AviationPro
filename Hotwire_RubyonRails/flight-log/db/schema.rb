# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_07_200033) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "flights", force: :cascade do |t|
    t.date "flight_date"
    t.decimal "flight_time", precision: 6, scale: 2, default: "0.0", null: false
    t.datetime "departure_time"
    t.datetime "arrival_time"
    t.string "pilot_role"
    t.boolean "solo", default: false, null: false
    t.boolean "cross_country", default: false, null: false
    t.boolean "night", default: false, null: false
    t.boolean "instructor", default: false, null: false
    t.string "departure_airport"
    t.string "arrival_airport"
    t.string "aircraft_registration"
    t.string "aircraft_type"
    t.string "flight_type"
    t.text "notes"
    t.integer "takeoffs", default: 0, null: false
    t.integer "landings", default: 0, null: false
    t.decimal "actual_instrument", precision: 6, scale: 2, default: "0.0", null: false
    t.decimal "simulated_instrument", precision: 6, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
