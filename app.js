const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mysql'
};

const adminConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_ADMIN_USER || process.env.DB_USER || 'root',
  password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(query);
    await connection.end();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query('SELECT NOW() AS currentTime');
    await connection.end();
    res.json({ connected: true, time: rows[0].currentTime });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.post('/api/create-user', async (req, res) => {
  const { dbName, username, password } = req.body;
  if (!dbName || !username || !password) {
    return res.status(400).json({ error: 'Database name, username, and password required' });
  }
  
  try {
    const connection = await mysql.createConnection(adminConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`);
    await connection.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${username}'@'%'`);
    await connection.query('FLUSH PRIVILEGES');
    await connection.end();
    res.json({ success: true, message: `User ${username} created with access to ${dbName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(adminConfig);
    const [rows] = await connection.query("SELECT User, Host FROM mysql.user WHERE User != 'root' AND User != 'mysql.session' AND User != 'mysql.sys' AND User != 'mysql.infoschema'");
    await connection.end();
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`App running on port ${port}`));
