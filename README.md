#  MERN Authentication System

A secure authentication system built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** that demonstrates modern authentication practices using **JWT Access Tokens**, **JWT Refresh Tokens**, **HttpOnly Cookies**, and **Refresh Token Rotation**.

This project was developed as part of a MERN Stack Internship technical assessment with a focus on secure authentication, clean architecture, and production-oriented development practices.

---

# Features

### Authentication

* User Registration
* User Login
* User Logout
* Protected Dashboard
* JWT Access Token Authentication
* JWT Refresh Token Authentication
* Automatic Token Refresh
* Refresh Token Rotation

### Security

* Password Hashing using bcrypt
* Refresh Tokens stored as hashed values in MongoDB
* HttpOnly Cookies for Refresh Tokens
* Protected API Routes using JWT Middleware
* Environment Variables for sensitive credentials
* Secure CORS configuration with credentials support

### Frontend

* Responsive React Interface
* Clean UI built with Tailwind CSS
* React Router for navigation
* Protected Routes
* Persistent Authentication Flow

---

#  Tech Stack

## Frontend

* React (Vite)
* React Router DOM
* Axios
* Tailwind CSS

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT (jsonwebtoken)
* bcryptjs
* cookie-parser
* dotenv
* cors

---

#  Project Structure

```text
mern-auth
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend
    ├── src
    │   ├── components
    │   ├── context
    │   ├── pages
    │   ├── services
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

# Authentication Flow

1. User registers with name, email, and password.
2. Password is securely hashed using bcrypt before storing it in MongoDB.
3. User logs in using valid credentials.
4. Backend generates:

   * Access Token
   * Refresh Token
5. Refresh Token is hashed and stored in MongoDB.
6. Original Refresh Token is sent to the browser as an **HttpOnly Cookie**.
7. Access Token is returned to the frontend.
8. Protected routes validate the Access Token using JWT middleware.
9. When the Access Token expires, the frontend requests a new Access Token using the Refresh Token.
10. During logout, the Refresh Token is removed from the database and the cookie is cleared.

---

#  API Endpoints

## Authentication

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/auth/signup`    | Register a new user         |
| POST   | `/api/auth/login`     | Login user                  |
| POST   | `/api/auth/refresh`   | Generate a new Access Token |
| POST   | `/api/auth/logout`    | Logout user                 |
| GET    | `/api/auth/dashboard` | Protected Dashboard Route   |

---

#  Environment Variables

## Backend (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret

REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLIENT_URL=http://localhost:5173
```

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

# 💻 Installation & Setup

## Clone Repository

```bash
git clone <repository-url>
cd mern-auth
```

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

#  Security Highlights

* Passwords are hashed using **bcrypt** before storage.
* JWT-based authentication with separate **Access** and **Refresh Tokens**.
* Refresh Tokens are stored as **hashed values** in MongoDB.
* Refresh Tokens are delivered through **HttpOnly Cookies**, reducing exposure to client-side scripts.
* Protected API routes use JWT authentication middleware.
* Sensitive configuration is managed through environment variables.

---

#  Future Improvements

* Email Verification
* Forgot Password / Password Reset
* Role-Based Authorization (RBAC)
* Login Rate Limiting
* Multi-Factor Authentication (MFA)
* User Profile Management
* Account Lockout Protection

---

#  Author

Developed by **Garv Goel** as part of a MERN Stack Internship Technical Assessment.
