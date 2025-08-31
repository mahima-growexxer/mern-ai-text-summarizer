# AI Text Summarizer - System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI TEXT SUMMARIZER                                │
│                              ARCHITECTURE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    API Calls    ┌─────────────────┐
│   CLIENT LAYER  │ ◄──────────────► │   SERVER LAYER  │ ◄──────────────► │  EXTERNAL APIs  │
│   (React/TS)    │                  │   (Node.js/TS)  │                  │   (OpenAI API)  │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
                                             │
                                             │
                                             ▼
                                     ┌─────────────────┐
                                     │   DATA LAYER    │
                                     │                 │
                                     │ ┌─────────────┐ │
                                     │ │   REDIS     │ │
                                     │ │   CACHE     │ │
                                     │ │             │ │
                                     │ └─────────────┘ │
                                     │ ┌─────────────┐ │
                                     │ │  MONGODB    │ │
                                     │ │ DATABASE    │ │
                                     │ └─────────────┘ │
                                     └─────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────┐    1. Text Input     ┌─────────────┐
│   Frontend  │ ──────────────────► │   Backend   │
│  (React)    │                     │  (Express)  │
└─────────────┘                     └─────────────┘
                                             │
                                             │ 2. Generate Hash
                                             ▼
                                     ┌─────────────┐
                                     │   Validator │
                                     │   (Utils)   │
                                     └─────────────┘
                                             │
                                             │ 3. Check Cache
                                             ▼
                                     ┌─────────────┐
                                     │    Redis    │
                                     │   (Cache)   │
                                     └─────────────┘
                                             │
                                             │ 4. Cache Miss?
                                             ▼
                                     ┌─────────────┐
                                     │  Database   │
                                     │ (MongoDB)   │
                                     └─────────────┘
                                             │
                                             │ 5. Not Found?
                                             ▼
                                     ┌─────────────┐
                                     │   OpenAI    │
                                     │    API      │
                                     └─────────────┘
                                             │
                                             │ 6. Save Results
                                             ▼
                                     ┌─────────────┐
                                     │ Save to DB  │
                                     │ & Cache     │
                                     └─────────────┘
```

## 🏛️ Component Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── TextArea.tsx          # Controlled input component
│   ├── ErrorMessage.tsx      # Error display component
│   └── Loader.tsx           # Loading state component
├── pages/
│   └── Home.tsx             # Main application page
├── App.tsx                  # Root component
└── main.tsx                # Application entry point
```

### Backend (Node.js + TypeScript)
```
src/
├── controllers/
│   └── summary.controller.ts    # Request handling logic
├── services/
│   └── summary.service.ts       # Business logic & API calls
├── models/
│   └── summary.ts              # MongoDB schema & indexes
├── routes/
│   └── summary.routes.ts       # API route definitions
├── utils/
│   ├── validator.ts            # Input validation
│   └── redisClient.ts          # Redis connection
├── config/
│   └── db.ts                   # Database connection
├── app.ts                      # Express app setup
└── server.ts                   # Server entry point
```

## ⚡ Performance Optimization Strategy

### 1. Caching Layer (Redis)
- **Purpose**: Reduce API calls and database queries
- **Strategy**: Two-tier caching (Redis → MongoDB)
- **TTL**: 24 hours for cached summaries
- **Key**: SHA256 hash of input text

### 2. Database Optimization (MongoDB)
- **Indexes**: 
  - `textHash` (unique, for exact matches)
  - `inputText` (text index for search)
  - `createdAt` (for time-based queries)
  - Compound index: `{textHash: 1, createdAt: -1}`


## 🔒 Security Architecture

```
┌─────────────────┐    HTTPS    ┌─────────────────┐
│   Client        │ ◄─────────► │   Load Balancer │
│   (Browser)     │             │   (Optional)    │
└─────────────────┘             └─────────────────┘
                                         │
                                         │ HTTPS
                                         ▼
                                ┌─────────────────┐
                                │   API Gateway   │
                                │   (Express)     │
                                │                 │
                                │ • Rate Limiting │
                                │ • CORS          │
                                │ • Validation    │
                                └─────────────────┘
                                         │
                                         │ Internal
                                         ▼
                                ┌─────────────────┐
                                │   Application   │
                                │   (Controllers) │
                                └─────────────────┘
                                         │
                                         │ Secure
                                         ▼
                                ┌─────────────────┐
                                │   Data Layer    │
                                │ (Redis + MongoDB)│
                                └─────────────────┘
```