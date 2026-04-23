import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../tasks.json');

const readDB = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

export const getTasks = async (req, res) => {
    const tasks = await readDB();
    res.json(tasks);
};

export const addTask = async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const tasks = await readDB();
    const newTask = { id: Date.now(), text, notes: '', subtasks: [], completed: false };
    tasks.push(newTask);
    await writeDB(tasks);
    res.status(201).json(newTask);
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;
    let tasks = await readDB();
    tasks = tasks.filter(t => t.id !== parseInt(id));
    await writeDB(tasks);
    res.status(204).send();
};

export const toggleTask = async (req, res) => {
    const { id } = req.params;
    const tasks = await readDB();
    const task = tasks.find(t => t.id === parseInt(id));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = !task.completed;
    await writeDB(tasks);
    res.json(task);
};

export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { text, notes, subtasks } = req.body;
    const tasks = await readDB();
    const task = tasks.find(t => t.id === parseInt(id));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (text !== undefined) task.text = text;
    if (notes !== undefined) task.notes = notes;
    if (subtasks !== undefined) task.subtasks = subtasks;
    
    await writeDB(tasks);
    res.json(task);
};

export const clearCompleted = async (req, res) => {
    let tasks = await readDB();
    tasks = tasks.filter(t => !t.completed);
    await writeDB(tasks);
    res.status(204).send();
};
