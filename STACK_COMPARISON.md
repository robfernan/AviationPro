# Flight Log Stack Comparison

Three implementations of the same Flight Log CRUD app using different technology stacks. All three apps are fully functional and running locally.

---

## Summary Table

| Aspect | Rails + Hotwire | Laravel + Livewire | WASP |
|--------|-----------------|-------------------|------|
| **Framework** | Ruby on Rails 7.2.3 | Laravel 12.x | vanilla JS + Express |
| **Frontend** | Hotwire (Turbo/Stimulus) | Livewire 4.x | HTML + vanilla JS |
| **Database** | PostgreSQL | SQLite (dev) | JSON file |
| **Real-time UI** | Turbo streams | Livewire reactive | Manual fetch + DOM updates |
| **Server Port** | 3000 | 8000 | 3001 (API) + 9001 (frontend) |
| **State Management** | Rails models + session | Laravel models + Livewire component | localStorage + backend API |
| **CSS Framework** | Tailwind CSS | Tailwind CSS + Vite | Tailwind CDN |
| **Build Tool** | Sprockets + importmap | Vite | None (static files) |
| **Development Speed** | Slow scaffolds (gem installs) | Very fast (composer + artisan) | Instant (no build) |
| **Production Ready** | Yes | Yes | Yes (basic) |
| **Setup Complexity** | High (Ruby, gems, DB) | Medium (PHP, extensions, Composer) | Low (Node, npm) |

---

## Folder Structure

### Hotwire_RubyonRails/flight-log

```
Hotwire_RubyonRails/flight-log/
├── Gemfile / Gemfile.lock       # Ruby dependencies
├── config/
│   ├── routes.rb                # Routes: root -> flights#index
│   └── database.yml             # PostgreSQL config
├── app/
│   ├── models/flight.rb         # Model + summary_totals method
│   ├── controllers/flights_controller.rb  # CRUD actions
│   ├── views/flights/           # index, show, new, edit, _form.html.erb
│   ├── javascript/
│   │   ├── application.js       # Hotwire + Stimulus entry
│   │   └── controllers/         # Stimulus JS controllers
│   └── assets/config/manifest.js
├── db/
│   ├── migrate/                 # Flights table migration
│   └── seeds.rb                 # 3 sample flights
├── bin/rails                    # Rails CLI
└── README.md
```

**Key Features:**
- Full Rails ORM with validations
- Stimulus JS for interactive components
- Turbo for seamless page transitions
- Asset pipeline (Sprockets + importmap)
- Runs on Puma server (port 3000)

**Start:**
```bash
cd Hotwire_RubyonRails/flight-log
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server -b 0.0.0.0 -p 3000
```

---

### PHP_Livewire/flight-log

```
PHP_Livewire/flight-log/
├── composer.json / composer.lock  # PHP dependencies
├── .env                           # Laravel config
├── config/
│   └── database.php               # SQLite config (dev)
├── app/
│   ├── Models/Flight.php          # Eloquent model
│   └── Livewire/
│       └── FlightDashboard.php    # Livewire component (create/read/delete)
├── database/
│   ├── migrations/                # Flights table
│   └── seeders/DatabaseSeeder.php # 3 sample flights
├── resources/
│   ├── views/
│   │   ├── layouts/app.blade.php  # Main layout (teal/orange theme)
│   │   └── livewire/flight-dashboard.blade.php  # Component UI
│   ├── css/app.css
│   └── js/app.js
├── public/
│   ├── build/                     # Vite-compiled assets
│   └── index.php
├── vite.config.js
├── artisan                        # Laravel CLI
└── README.md
```

**Key Features:**
- Livewire reactive components (live form + table)
- Blade templating with Tailwind
- Eloquent ORM (similar to Rails models)
- Vite asset bundler (fast rebuilds)
- Runs on PHP artisan (port 8000)
- SQLite DB (no external server needed in dev)

**Start:**
```bash
cd PHP_Livewire/flight-log
composer install
npm install && npm run build
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

---

### WASP/flight-log

```
WASP/flight-log/
├── index.html                  # Single page (Tailwind CDN)
├── app.js                      # Vanilla JS (inlined helpers)
│   ├── Storage functions (localStorage)
│   ├── CSV export/import
│   └── API fetch calls
├── storage.js                  # localStorage helpers (optional/docs)
├── csv.js                      # CSV helpers (optional/docs)
├── backend/
│   ├── package.json            # Node.js dependencies
│   ├── server.js               # Express API server
│   ├── init-db.js              # Seeder script
│   └── data.json               # JSON file DB
├── README.md
└── STACK_COMPARISON.md (this file)
```

**Key Features:**
- **Frontend:** Vanilla HTML + JS, left-nav layout, violet/yellow theme
- **Backend:** Express.js REST API (minimal, ~80 lines)
- **Database:** JSON file (no SQL server needed)
- **Build:** None (instant static serve)
- **Real-time:** Fetch + manual DOM refresh (no reactivity framework)
- **Persistence:** Dual mode (localStorage fallback + API when available)

**Start:**
```bash
# Terminal 1: Backend
cd WASP/flight-log/backend
npm install
node init-db.js
node server.js  # runs on port 3001

# Terminal 2: Frontend
cd WASP/flight-log
python3 -m http.server 9001 --bind 127.0.0.1 --directory .
# open http://127.0.0.1:9001/index.html
```

---

## Key Differences

### Architecture

| Layer | Rails | Laravel | WASP |
|-------|-------|---------|------|
| **Server Type** | Monolithic | Monolithic | Decoupled (API + static) |
| **Routes** | Rails router | Laravel router | Express REST API |
| **Views** | ERB templates | Blade templates | HTML (no templates) |
| **Components** | Rails views | Livewire components | Vanilla JS functions |

### Data Flow

**Rails:**
```
Form → Controller → Model → DB → View → HTML
(all in same process, synchronous)
```

**Laravel:**
```
Livewire Form → Component Logic → Eloquent Model → SQLite
(same process, component re-renders reactively)
```

**WASP:**
```
HTML Form → app.js → Fetch API → Express → JSON file
(separate frontend/backend, async API calls)
```

### UI Patterns

- **Rails:** Server-side rendering + Turbo streams for dynamic updates
- **Laravel:** Livewire components auto-update on property changes
- **WASP:** Manual fetch-and-update pattern (Vue/React would be similar)

### Performance Characteristics

- **Rails:** Slower to scaffold/start (gem installs), but production-mature
- **Laravel:** Fastest to develop (Composer is quick), excellent for medium-scale apps
- **WASP:** Instant startup, no build step, lightweight frontend, scales to full-stack with React later

### Color Schemes (UI Differentiation)

- **Rails:** Dark slate theme (grays and sky blue)
- **Laravel:** Light teal/orange theme (professional look)
- **WASP:** Violet/yellow theme (sidebar layout, unique)

---

## Deployment Considerations

### Rails
- Requires Ruby, PostgreSQL
- Traditional app server (Puma, Unicorn)
- Suitable for monolithic architectures

### Laravel
- Requires PHP, can use SQLite/MySQL
- Runs on any shared hosting or cloud
- Excellent for small-to-medium business apps

### WASP
- Frontend: static hosting (GitHub Pages, Netlify, etc.)
- Backend: Node.js hosting (Heroku, Railway, Vercel serverless, etc.)
- Easiest to host separately (great for microservices)

---

## Learning Outcomes

After comparing these three stacks, you've now seen:

1. **Full-stack web app architecture** in three different paradigms
2. **MVC pattern** (Rails, Laravel) vs. **API-first pattern** (WASP)
3. **Server-side rendering** (Rails/Laravel) vs. **frontend-backend separation** (WASP)
4. **Database integration** from simple JSON to relational (PostgreSQL) and hybrid (SQLite)
5. **Real-time UI updates:** Turbo streams, Livewire reactivity, manual JS

---

## Quick Recap

| | Fastest to Build | Best for Learning | Best for Production | Easiest to Deploy |
|---|---|---|---|---|
| **Rails** | ❌ | ✅ (comprehensive) | ✅ | ⚠️ (needs infra) |
| **Laravel** | ✅ | ✅ (balanced) | ✅ | ✅ |
| **WASP** | ✅ | ✅ (clean JS) | ⚠️ (simple apps) | ✅ |

---

## Next Steps

Want to extend any of these apps? Consider:

- **Rails:** Add API mode, background jobs (Sidekiq), caching
- **Laravel:** Add API routes, queue jobs (Redis), websockets (Pusher/broadcast)
- **WASP:** Upgrade frontend to React + Vite, add WebSocket support for real-time

Or compare with a fourth stack (Django, FastAPI, Next.js, etc.)!
