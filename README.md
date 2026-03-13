# 🎪 EVENTORA — AI-Powered Event Management Platform

> India's premier AI-driven event marketplace connecting users with the finest vendors for halls, catering, decoration, photography, and more.

---

## ✨ Features

### For Users
- 🔍 **Smart Search** — Filter vendors by city, budget, rating, occasion
- 🤖 **AI Recommendations** — Personalized vendor ranking algorithm
- ❤️ **Wishlist** — Save favorite vendors
- 📅 **Booking System** — Book with conflict prevention (no duplicate category on same date)
- 💬 **AI Chatbot** — 24/7 intelligent event planning assistant
- 💰 **Budget Calculator** — AI-powered event cost estimation

### For Vendors
- 📊 **Smart Dashboard** — Bookings, earnings charts, AI insights
- 📸 **Gallery Manager** — Upload images, logo, cover banner
- ⚡ **Booking Management** — Confirm / Reject / Waitlist with one click
- 🏆 **AI Ranking Score** — Multi-factor dynamic ranking displayed
- 📈 **Analytics** — Revenue trends, booking heatmaps

### Platform
- 🛡️ **Admin Panel** — Vendor approval, fraud detection, analytics
- 🔐 **JWT Authentication** — Secure token-based auth
- 📧 **OTP Verification** — Email OTP with Redis expiry
- ⚡ **Redis Caching** — Chatbot responses, sessions cached
- 🧠 **Python AI Service** — Scikit-learn ranking + budget estimation

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Java 17 + Spring Boot 3.2 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| AI Engine | Python 3.11 + Scikit-learn + Flask |
| Auth | JWT (JJWT) + BCrypt |
| Email | Spring Mail (SMTP) |
| Charts | Recharts |
| Animations | Framer Motion |

---

## 🚀 Quick Start

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone and enter directory
cd eventora

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your SMTP credentials and JWT secret

# 3. Start all services
docker-compose up -d

# 4. Access the platform
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080/api
# API Docs: http://localhost:8080/api/swagger-ui.html
# AI Service: http://localhost:5000
```

### Option B: Manual Setup

#### Prerequisites
- Java 17+
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Maven 3.9+

#### 1. Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE eventora;"
psql -U postgres -c "CREATE USER eventora_user WITH PASSWORD 'eventora_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE eventora TO eventora_user;"

# Run schema
psql -U eventora_user -d eventora -f database/schema.sql
```

#### 2. Redis
```bash
# Start Redis
redis-server
```

#### 3. AI Microservice
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Running on http://localhost:5000
```

#### 4. Spring Boot Backend
```bash
cd backend

# Configure in application.yml or set env vars:
# DB_USERNAME, DB_PASSWORD, MAIL_USERNAME, MAIL_PASSWORD, JWT_SECRET

mvn spring-boot:run
# Running on http://localhost:8080/api
```

#### 5. React Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 📁 Project Structure

```
eventora/
├── frontend/                  # React + Vite App
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/           # AIChatbot
│   │   │   ├── auth/         # Auth forms
│   │   │   ├── common/       # VendorCard, shared
│   │   │   └── layout/       # Navbar, Footer
│   │   ├── pages/            # Route pages
│   │   ├── context/          # AuthContext
│   │   ├── services/         # API calls (axios)
│   │   └── hooks/            # Custom hooks
│   └── package.json
│
├── backend/                   # Spring Boot App
│   └── src/main/java/com/eventora/
│       ├── config/           # Security, Redis, Web configs
│       ├── controller/       # REST controllers
│       ├── service/          # Business logic
│       ├── repository/       # JPA repositories
│       ├── model/            # JPA entities
│       ├── security/         # JWT filter & service
│       └── exception/        # Global error handling
│
├── ai-service/                # Python Flask Microservice
│   ├── app.py                # Main Flask app
│   └── requirements.txt
│
├── database/
│   └── schema.sql            # PostgreSQL schema
│
├── docker-compose.yml         # Full stack orchestration
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user/vendor |
| POST | `/api/auth/verify-email` | Verify email OTP |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/reset-password` | Reset with OTP |

### Vendors (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/vendors` | List with filters |
| GET | `/api/public/vendors/:id` | Vendor detail |
| GET | `/api/public/vendors/top` | AI top picks |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my-bookings` | User's bookings |
| GET | `/api/bookings/vendor-bookings` | Vendor's queue |
| PUT | `/api/bookings/:id/status` | Update status |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/public/chat` | Public AI chat |
| POST | `/api/chatbot/chat` | Authenticated chat |

---

## 🧠 AI Ranking Algorithm

Vendor ranking score is computed as a weighted sum:

```
Score = (avg_rating × 0.25)
      + (booking_success_rate × 0.20)
      + (wishlist_score × 0.10)
      + (response_time_score × 0.15)
      + (price_competitiveness × 0.10)
      + (profile_completion × 0.10)
      + (ai_popularity_score × 0.10)
      × 1.05 (if verified)
```

Scores recalculate hourly via Spring scheduled task and Python AI service.

---

## 🔐 Environment Variables

```env
# Backend
DB_USERNAME=eventora_user
DB_PASSWORD=eventora_pass
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=your-256-bit-secret-key-here
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-app-password
AI_SERVICE_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:8080/api
```

---

## 📧 Email Setup (Gmail)

1. Enable 2FA on Gmail
2. Create App Password: Google Account → Security → App Passwords
3. Use the 16-char app password as `MAIL_PASSWORD`

---

## 🎨 Design System

- **Primary**: Royal Dark Blue `#0A0F2E`
- **Accent**: Gold `#FFD700`
- **Purple**: `#6B21A8`
- **Style**: Glassmorphism + Framer Motion animations
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Theme**: Luxury dark with gold accents

---

## 📝 License

© 2024 Eventora. All rights reserved. Built with ❤️ in India.
