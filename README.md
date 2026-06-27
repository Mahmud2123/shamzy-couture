# SHAMZY COUTURE 🧵

> Bespoke Fashion, Crafted for You

A full-stack e-commerce platform for bespoke fashion — built with React, Express, TypeScript, Prisma, and PostgreSQL.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- npm or yarn

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
```bash
# Create the database first
createdb shamzy_couture

# Run migrations
npx prisma migrate dev --name init

# Seed with sample data (10 products + admin + customer)
npm run prisma:seed
```

### 3. Run the app
```bash
npm run dev:all
```

This starts:
- **API server** → http://localhost:3001
- **Frontend** → http://localhost:5173

---

## 🔑 Login Credentials

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | shamzy@shamzycouture.com     | shamzy123   |
| Customer | customer@example.com         | customer123 |

---

## 📁 Project Structure

```
shamzy-couture/
├── server.ts                   # Express API server (port 3001)
├── api/
│   ├── _helpers.ts             # Prisma, JWT, auth helpers
│   ├── auth/                   # login, register, me
│   ├── products/               # CRUD + [id]
│   ├── orders/                 # create, list, [id], [id]/status
│   ├── measurements/           # create, list, [id]
│   └── design-requests/        # create, list, all, [id]/status, [id]/messages
├── frontend/src/
│   ├── App.tsx                 # Router + providers
│   ├── pages/                  # All page components
│   ├── components/             # Navbar, Footer, ProductCard
│   ├── contexts/               # AuthContext, CartContext
│   ├── services/               # API service layer
│   └── types/                  # TypeScript interfaces
├── prisma/
│   ├── schema.prisma           # DB schema
│   └── seed.ts                 # 10 products + users
└── public/images/              # Place product images here
```

---

## 🖼️ Product Images

Place your images in `public/images/` with these filenames:

| File             | Category    |
|------------------|-------------|
| suit-1.jpg       | Suits       |
| suit-2.jpg       | Suits       |
| dress-1.jpg      | Dresses     |
| dress-2.jpg      | Dresses     |
| jacket-1.jpg     | Outerwear   |
| jacket-2.jpg     | Outerwear   |
| shirt-1.jpg      | Shirts      |
| shirt-2.jpg      | Shirts      |
| accessory-1.jpg  | Accessories |
| accessory-2.jpg  | Accessories |

If no image is provided, a placeholder from Unsplash will be shown automatically.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint          | Auth     |
|--------|-------------------|----------|
| POST   | /api/auth/login   | Public   |
| POST   | /api/auth/register| Public   |
| GET    | /api/auth/me      | Required |

### Products
| Method | Endpoint             | Auth     |
|--------|----------------------|----------|
| GET    | /api/products        | Public   |
| GET    | /api/products/:id    | Public   |
| POST   | /api/products        | Admin    |
| PUT    | /api/products/:id    | Admin    |
| DELETE | /api/products/:id    | Admin    |

### Orders
| Method | Endpoint                | Auth     |
|--------|-------------------------|----------|
| POST   | /api/orders             | Required |
| GET    | /api/orders             | Required |
| GET    | /api/orders/:id         | Required |
| PUT    | /api/orders/:id/status  | Admin    |

### Measurements
| Method | Endpoint                | Auth     |
|--------|-------------------------|----------|
| POST   | /api/measurements       | Required |
| GET    | /api/measurements       | Required |
| GET    | /api/measurements/:id   | Required |

### Design Requests
| Method | Endpoint                          | Auth     |
|--------|-----------------------------------|----------|
| POST   | /api/design-requests              | Required |
| GET    | /api/design-requests              | Required |
| GET    | /api/design-requests/all          | Admin    |
| PUT    | /api/design-requests/:id/status   | Admin    |
| POST   | /api/design-requests/:id/messages | Required |

---

## ⚙️ Scripts

```bash
npm run dev:all         # Start both API + frontend
npm run dev:api         # API only (port 3001)
npm run dev             # Frontend only (port 5173)
npm run prisma:studio   # Open Prisma Studio (DB GUI)
npm run prisma:seed     # Re-seed the database
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript (ESM)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **UI**: react-icons, react-hot-toast, react-router-dom
