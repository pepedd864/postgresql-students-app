const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use environment variable DATABASE_URL or fallback to local
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/health', (req, res) => res.json({ ok: true }));

// CRUD for students
app.get('/api/students', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, age, class FROM students ORDER BY id');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, age, class: cls } = req.body;
  try {
    const r = await pool.query('INSERT INTO students(name, age, class) VALUES($1,$2,$3) RETURNING id, name, age, class', [name, age, cls]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const id = req.params.id;
  const { name, age, class: cls } = req.body;
  try {
    const r = await pool.query('UPDATE students SET name=$1, age=$2, class=$3 WHERE id=$4 RETURNING id, name, age, class', [name, age, cls, id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const r = await pool.query('DELETE FROM students WHERE id=$1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
