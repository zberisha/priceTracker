# PriceTracker

MERN stack application for tracking product prices across e-commerce platforms (Amazon, Walmart, eBay), with a Python Scrapy microservice for web scraping.

## Architecture

```
Frontend (React.js)          Backend (Node.js/Express)        Database (MongoDB)
├── Auth Context             ├── REST API Routes              ├── Users
├── shadcn/ui + Tailwind     ├── Auth Middleware               ├── Products
├── Redux Toolkit            ├── Controllers                  ├── Competitors
└── Axios HTTP Client        └── Service Layer                ├── Prices
                                                              ├── Alerts
Scraper (Python)             External Services                ├── Tracking
├── FastAPI server           ├── Task Scheduler (node-cron)   └── Subscriptions
├── Scrapy spiders           ├── Notification (nodemailer)
│   ├── Amazon               └── Redis Cache (ioredis)
│   ├── Walmart
│   └── eBay
└── crochet (Twisted bridge)
```

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **MongoDB** running locally or a connection URI
- **Redis** (optional, for caching)

## Setup

```bash
# 1. Install all dependencies
npm install
npm run install-all

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.

# 3. Run all three services (backend + frontend + scraper)
npm run dev

# Or run without scraper
npm run dev:web
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Scraper: http://localhost:8000

## Scraper Service

The scraper is a standalone Python FastAPI microservice in `scraper/`. It runs Scrapy spiders on demand.

### Manual setup

```bash
cd scraper
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### API

```bash
# Scrape a product
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.com/dp/B0EXAMPLE", "platform": "amazon"}'

# Response
{
  "price": 29.99,
  "title": "Product Name",
  "image": "https://...",
  "platform": "amazon",
  "url": "https://...",
  "error": null
}

# Health check
curl http://localhost:8000/health
```

### How it connects

1. Node.js `scheduler.service.js` runs on a cron schedule
2. For each tracked product, it calls `scraper.service.js`
3. `scraper.service.js` sends `POST /scrape` to the Python service
4. Python runs the appropriate Scrapy spider and returns results
5. Node.js saves the price to MongoDB and checks alert conditions

## API Endpoints

### Auth
| Method | Endpoint             | Description       |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Register user      |
| POST   | /api/auth/login     | Login              |
| GET    | /api/auth/profile   | Get profile        |
| PUT    | /api/auth/profile   | Update profile     |

### Products
| Method | Endpoint                  | Description         |
|--------|--------------------------|----------------------|
| GET    | /api/products            | List products        |
| POST   | /api/products            | Create product       |
| GET    | /api/products/:id        | Get product          |
| PUT    | /api/products/:id        | Update product       |
| DELETE | /api/products/:id        | Delete product       |
| GET    | /api/products/:id/prices | Price history        |

### Competitors
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | /api/competitors       | List competitors     |
| POST   | /api/competitors       | Create competitor    |
| GET    | /api/competitors/:id   | Get competitor       |
| PUT    | /api/competitors/:id   | Update competitor    |
| DELETE | /api/competitors/:id   | Delete competitor    |

### Alerts
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | /api/alerts            | List alerts          |
| POST   | /api/alerts            | Create alert         |
| PUT    | /api/alerts/read-all   | Mark all read        |
| PUT    | /api/alerts/:id/read   | Mark one read        |
| DELETE | /api/alerts/:id        | Delete alert         |

### Tracking
| Method | Endpoint             | Description          |
|--------|---------------------|----------------------|
| GET    | /api/tracking       | List trackings       |
| POST   | /api/tracking       | Start tracking       |
| PUT    | /api/tracking/:id   | Update tracking      |
| DELETE | /api/tracking/:id   | Stop tracking        |

### Subscriptions
| Method | Endpoint                 | Description          |
|--------|-------------------------|----------------------|
| GET    | /api/subscriptions/plans | List plans           |
| GET    | /api/subscriptions       | Get subscription     |
| PUT    | /api/subscriptions       | Update subscription  |

## Project Structure

```
priceTracker/
├── server/                  # Node.js Express backend
│   └── src/
│       ├── config/          # DB & Redis connections
│       ├── controllers/     # Request handlers
│       ├── middleware/       # Auth middleware
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routes
│       ├── services/        # Business logic, scheduler, notifications, scraper client
│       ├── utils/           # Logger, error class, JWT helper
│       └── index.js         # Entry point
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Layout, PrivateRoute, shadcn/ui
│       ├── context/         # AuthContext
│       ├── pages/           # All page components
│       ├── services/        # Axios API client
│       ├── store/           # Redux Toolkit store & slices
│       └── App.jsx          # Root with routing
├── scraper/                 # Python Scrapy microservice
│   ├── spiders/             # Platform-specific spiders
│   │   ├── amazon.py
│   │   ├── walmart.py
│   │   └── ebay.py
│   ├── app.py               # FastAPI entry point
│   ├── settings.py          # Scrapy settings
│   └── requirements.txt
└── package.json             # Root scripts (concurrently)
```
