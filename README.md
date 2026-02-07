# PriceTracker

MERN stack application for tracking product prices across e-commerce platforms (Amazon, Walmart, eBay).

## Architecture

```
Frontend (React.js)          Backend (Node.js/Express)        Database (MongoDB)
├── Auth Context             ├── REST API Routes              ├── Users
├── React UI Components      ├── Auth Middleware               ├── Products
├── Redux Toolkit            ├── Controllers                  ├── Competitors
└── Axios HTTP Client        └── Service Layer                ├── Prices
                                                              ├── Alerts
External Services                                             ├── Tracking
├── Task Scheduler (node-cron)                                └── Subscriptions
├── Web Scraping (cheerio)
├── Notification (nodemailer)
└── Redis Cache (ioredis)
```

## Prerequisites

- **Node.js** >= 18
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

# 3. Run development servers (backend + frontend concurrently)
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

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
├── server/
│   └── src/
│       ├── config/          # DB & Redis connections
│       ├── controllers/     # Request handlers
│       ├── middleware/       # Auth middleware
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routes
│       ├── services/        # Business logic, scraper, scheduler, notifications
│       ├── utils/           # Logger, error class, JWT helper
│       └── index.js         # Entry point
├── client/
│   └── src/
│       ├── components/      # Layout, PrivateRoute
│       ├── context/         # AuthContext
│       ├── pages/           # All page components
│       ├── services/        # Axios API client
│       ├── store/           # Redux Toolkit store & slices
│       └── App.js           # Root with routing
└── package.json             # Root scripts (concurrently)
```
