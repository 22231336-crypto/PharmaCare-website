const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmacare_db'
});

const queries = [
  "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS reply TEXT DEFAULT NULL",
  "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at DATETIME DEFAULT NULL",
  "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_by INT DEFAULT NULL",
  "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new'"
];

db.connect((err) => {
  if (err) {
    console.error('DB connect error:', err);
    process.exit(1);
  }
  console.log('Connected to DB');
  let i = 0;
  function next() {
    if (i >= queries.length) {
      console.log('All queries executed');
      db.end();
      return;
    }
    const q = queries[i++];
    console.log('Executing:', q);
    db.query(q, (e) => {
      if (e) console.warn('Query error:', e.message || e);
      else console.log('OK');
      next();
    });
  }
  next();
});
