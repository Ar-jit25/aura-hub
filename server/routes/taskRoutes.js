import express from 'express';
import { getTasks, addTask, deleteTask, toggleTask, updateTask, clearCompleted } from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTasks);
router.post('/', addTask);
router.delete('/completed', clearCompleted);
router.delete('/:id', deleteTask);
router.patch('/:id', toggleTask);
router.put('/:id', updateTask);

export default router;
