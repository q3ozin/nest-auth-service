## 🛠 Tech Stack

* **Framework:** NestJS (TypeScript)
* **Database:** PostgreSQL (User data & persistent store)
* **Caching & Sessions:** Redis (Token blacklist & rate limiting)
* **Auth & Security:** JWT, Passport.js, Bcrypt, Class-Validator (DTOs)
* **DevOps:** Docker & Docker Compose

---

## 🚀 Key Features

* **User Management:** Secure Sign-up, Sign-in, and Password Hashing.
* **Token Auth:** Access Tokens & Refresh Tokens using JWT.
* **Access Control:** Role-Based Authorization (RBAC).
* **Validation & Security:** Request payload validation with DTOs and Redis token caching.
* **Logging:** Centralized error logging and system activity tracking.

---

## 🗺️ Roadmap & Features

- [x] **Core Architecture**: NestJS setup with Controller-Service-Repository pattern
- [x] **Database & ORM**: PostgreSQL integration using Prisma ORM
- [x] **User Authentication**: Secure Login & Register flows with Bcrypt password hashing
- [x] **Security & Rate Limiting**: Input validation DTOs and endpoint throttling
- [x] **JWT Tokens**: Short-lived Access Tokens & Refresh Token rotation
- [x] **Session & Caching**: Redis integration for token blacklisting and fast lookup
- [ ] **Authorization**: Role-Based Access Control (RBAC) with custom Guards
- [ ] **Containerization**: Full Docker & Docker Compose environment
