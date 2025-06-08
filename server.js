// === server.js ===
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'dompetRahasia';

app.get('/api/balance/:username', (req, res) => {
  const { username } = req.params;
  db.getBalance(username, (err, balance) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ username, balance });
  });
});

app.post('/api/transfer', async (req, res) => {
  const { to_system_url, from_user, to_user, amount } = req.body;
  db.getBalance(from_user, async (err, balance) => {
    if (err || balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance or user not found' });
    }
    db.updateBalance(from_user, -amount, async (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update balance' });
      try {
        const axios = require('axios');
        await axios.post(`${to_system_url}/api/receive`, {
          from: process.env.SYSTEM_NAME || 'UnknownSystem',
          to_user,
          amount
        });
        res.json({ message: 'Transfer sent' });
      } catch (e) {
        db.updateBalance(from_user, amount, () => {});
        res.status(500).json({ error: 'Transfer failed. Rolled back.' });
      }
    });
  });
});

app.post('/api/receive', (req, res) => {
  const { from, to_user, amount } = req.body;
  if (!from || !to_user || !amount) return res.status(400).json({ error: 'Invalid payload' });
  db.updateBalance(to_user, amount, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to credit balance' });
    res.json({ message: `Received ${amount} from ${from}` });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.getUser(username, (err, user) => {
    if (err || !user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, SECRET);
    res.json({ token });
  });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.registerUser(username, password, err => {
    if (err) {
      console.error('Register error:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      return res.status(500).json({ error: 'Failed to register user' });
    }
    res.json({ message: 'Registered successfully' });
  });
});



// Default redirect to index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Only call db.init() once!
db.init().then(() => {
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
