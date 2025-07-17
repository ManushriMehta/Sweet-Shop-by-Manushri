
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
cd Sweet-Shop-by-Manushri
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
### ✅ Test Cases Overview

This project includes API test cases for the **SweetShop** service, using:

- 🧪 Mocha
- 💭 Chai
- 🔁 Supertest
- 🧠 mongodb-memory-server for in-memory testing

Each test case is written as a separate file under the `test/` directory for clarity and modularity.

---

#### 🧾 Test Case Summary

| Test File                             | Description                                         | Expected Result                |
|--------------------------------------|-----------------------------------------------------|-------------------------------|
| `test_create_sweet.js`               | Creates a new sweet with given attributes           | Returns `201` and sweet data  |
| `test_get_sweets.js`                 | Fetches the list of available sweets                | Returns `200` and sweet array |
| `test_purchase_sweet_success.js`     | Purchases a sweet within available quantity         | Returns `200`, updated stock  |
| `test_purchase_sweet_fail.js`        | Fails to purchase more sweets than in stock         | Returns `400` with error      |

---

### 🏃‍♂️ Running Tests

Make sure dependencies are installed:

```bash
npm install
npx mocha test/*.js
```

### 📝 **Note**: This section was generated with the help of AI. Please review and customize for your specific project context if needed.

#### **Created by Manushri Mehta with the use of ChatGPT as an Incubyte TDD assesment task**

