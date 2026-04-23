const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'aura_sanctuary_secret_keys_2026';

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'aura_vault.json');

async function getDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    const initial = { users: [], tasks: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial));
    return initial;
  }
}

async function saveDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDB();
  if (db.users.find(u => u.username === username)) return res.status(400).json({ message: 'Username already taken' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), username, password: hashedPassword };
  db.users.push(newUser);
  await saveDB(db);
  
  const token = jwt.sign({ id: newUser.id }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, username } });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDB();
  const user = db.users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username } });
});

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Login required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Session expired' }); }
};

app.get('/api/tasks', auth, async (req, res) => {
  const db = await getDB();
  const userTasks = db.tasks.filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

app.post('/api/tasks', auth, async (req, res) => {
  const db = await getDB();
  const newTask = { ...req.body, _id: Date.now().toString(), userId: req.user.id };
  db.tasks.push(newTask);
  await saveDB(db);
  res.json(newTask);
});

app.patch('/api/tasks/:id', auth, async (req, res) => {
  const db = await getDB();
  const task = db.tasks.find(t => t._id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  task.completed = !task.completed;
  await saveDB(db);
  res.json(task);
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  const db = await getDB();
  const index = db.tasks.findIndex(t => t._id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });
  db.tasks[index] = { ...db.tasks[index], ...req.body };
  await saveDB(db);
  res.json(db.tasks[index]);
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  const db = await getDB();
  db.tasks = db.tasks.filter(t => t._id !== req.params.id || t.userId !== req.user.id);
  await saveDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Aura Hub Live on Port ${PORT}`));
