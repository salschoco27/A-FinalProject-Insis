const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('wallet.db');

module.exports = {
  init: () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
          username TEXT PRIMARY KEY,
          password TEXT,
          balance INTEGER DEFAULT 0
        )`, err => {
          if (err) reject(err);
          else {
            db.run(`INSERT OR IGNORE INTO users (username, password, balance) VALUES 
              ('user_a', '', 10000),
              ('user_b', '', 0)`, () => resolve());
          }
        });
      });
    });
  },

  registerUser: (username, password, cb) => {
  if (!username || !password) return cb(new Error('Username or password missing'));
  db.run(`INSERT INTO users (username, password, balance) VALUES (?, ?, 0)`, [username, password], function(err) {
    cb(err);
  });
},


  getUser: (username, cb) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], cb);
  },

  getBalance: (username, cb) => {
    db.get(`SELECT balance FROM users WHERE username = ?`, [username], (err, row) => {
      if (err || !row) cb(err || new Error("User not found"));
      else cb(null, row.balance);
    });
  },

  updateBalance: (username, delta, cb) => {
    db.run(`UPDATE users SET balance = balance + ? WHERE username = ?`, [delta, username], function (err) {
      cb(err);
    });
  }
};
