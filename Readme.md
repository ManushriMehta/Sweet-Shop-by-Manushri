
# 🍬 Sweet Shop Manager

A full-stack Node.js + MongoDB application for managing and purchasing Indian sweets. Built with TDD and clean API architecture.

---

## 🚀 Features

- Add, update, and delete sweets
- Search and filter sweets
- Manage cart and checkout
- Admin login
- Stock quantity updates on purchase/clear
- MongoDB backend
- Fully tested with Mocha, Chai, and Supertest

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Testing:** Mocha, Chai, Supertest, mongodb-memory-server

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/sweet-shop-manager.git
cd sweet-shop-manager
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sweetshop
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

---

## ▶️ Run the App

```bash
npm start
```

Open in browser:
```
http://localhost:5000
```

---

## ✅ Run Tests (TDD)

```bash
# For CMD or Bash
npm test

# For PowerShell
$env:NODE_ENV="test"; npm test
```

Uses in-memory MongoDB for safe testing without touching production data.

---


