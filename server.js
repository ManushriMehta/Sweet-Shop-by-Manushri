const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetshop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const sweetSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  sweet_id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const Sweet = mongoose.model('Sweet', sweetSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Admin = mongoose.model('Admin', adminSchema);

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ error: 'Invalid token' });

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (password === '123') {
      const token = jwt.sign({ id: 'admin' }, process.env.JWT_SECRET || 'your-secret-key');
      res.json({ token, message: 'Admin logged in successfully' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD for sweets
app.get('/api/sweets', async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sweets', async (req, res) => {
  try {
    const { id, name, category, price, quantity } = req.body;
    const existing = await Sweet.findOne({ id });
    if (existing) return res.status(400).json({ error: 'Sweet with this ID already exists' });

    const sweet = new Sweet({ id, name, category, price, quantity });
    await sweet.save();
    res.status(201).json(sweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sweets/:id', async (req, res) => {
  try {
    const sweet = await Sweet.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sweets/:id', async (req, res) => {
  try {
    const sweet = await Sweet.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase & Restock
app.post('/api/sweets/:id/purchase', async (req, res) => {
  try {
    const { qty } = req.body;
    const sweet = await Sweet.findOne({ id: parseInt(req.params.id) });
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    if (sweet.quantity < qty) return res.status(400).json({ error: 'Not enough stock' });

    sweet.quantity -= qty;
    sweet.updatedAt = Date.now();
    await sweet.save();
    res.json({ message: 'Purchase successful', sweet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sweets/:id/restock', async (req, res) => {
  try {
    const { qty } = req.body;
    const sweet = await Sweet.findOne({ id: parseInt(req.params.id) });
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });

    sweet.quantity += qty;
    sweet.updatedAt = Date.now();
    await sweet.save();
    res.json({ message: 'Restock successful', sweet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cart endpoints
app.get('/api/cart', async (req, res) => {
  try {
    const items = await Cart.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { sweet_id, name, price, qty } = req.body;
    const cartItem = new Cart({ sweet_id, name, price, qty });
    await cartItem.save();
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const items = await Cart.find();
    for (const item of items) {
      await Sweet.findOneAndUpdate(
        { id: item.sweet_id },
        { $inc: { quantity: item.qty }, updatedAt: new Date() }
      );
    }
    await Cart.deleteMany({});
    res.json({ message: 'Cart cleared and stock restored successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extras
app.get('/api/sweets/search', async (req, res) => {
  try {
    const { term } = req.query;
    const sweets = await Sweet.find({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } }
      ]
    });
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sweets/sorted', async (req, res) => {
  try {
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    const sweets = await Sweet.find().sort({ price: sortOrder });
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // so supertest can import it

