import React, { useState, useEffect } from 'react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [expandedNotesId, setExpandedNotesId] = useState(null);
  const [tempText, setTempText] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const API_URL = 'http://localhost:5000/api/tasks';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (err) { console.error('Fetch error:', err); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, notes: '' }),
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      setInput('');
    } catch (err) { console.error('Add error:', err); }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'PATCH' });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (err) { console.error('Toggle error:', err); }
  };

  const saveTaskUpdate = async (id, payload) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      console.log('Saved successfully:', payload);
    } catch (err) { 
      console.error('Update error:', err); 
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const clearCompleted = async () => {
    try {
      await fetch(`${API_URL}/completed`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => !t.completed));
    } catch (err) { console.error('Clear error:', err); }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error('Delete error:', err); }
  };

  const handleEditStart = (task) => {
    setEditingId(task.id);
    setTempText(task.text);
  };

  const handleEditSave = (id) => {
    if (tempText.trim()) {
      saveTaskUpdate(id, { text: tempText });
    }
    setEditingId(null);
  };

  const handleNotesToggle = (task) => {
    if (expandedNotesId === task.id) {
      saveTaskUpdate(task.id, { notes: tempNotes });
      setExpandedNotesId(null);
    } else {
      setExpandedNotesId(task.id);
      setTempNotes(task.notes || '');
    }
  };

  return (
    <div className="task-container glass">
      <div className="task-header">
        <div className="title-area">
          <h3>Daily Intentions</h3>
          {isSyncing && <span className="sync-badge">Saving...</span>}
        </div>
        {tasks.some(t => t.completed) && (
          <button className="clear-btn" onClick={clearCompleted}>Clear Completed</button>
        )}
      </div>
      
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="What is your focus?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">+</button>
      </form>

      <div className="tasks-scroll">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.completed ? 'is-done' : ''} ${expandedNotesId === task.id ? 'is-expanded' : ''}`}>
            <div className="task-main">
              <div className="task-clickable" onClick={() => toggleTask(task.id)}>
                <div className="status-ring"></div>
                {editingId === task.id ? (
                  <input 
                    autoFocus
                    className="inline-edit-input"
                    value={tempText}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => handleEditSave(task.id)}
                    onChange={(e) => setTempText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave(task.id)}
                  />
                ) : (
                  <span className="task-label">{task.text}</span>
                )}
              </div>

              <div className="task-actions">
                <button 
                  className={`action-btn note-toggle ${task.notes ? 'has-notes' : ''}`} 
                  onClick={(e) => {e.stopPropagation(); handleNotesToggle(task)}}
                >
                  📝
                </button>
                <button 
                  className="action-btn edit-btn" 
                  onClick={(e) => {e.stopPropagation(); handleEditStart(task)}}
                >
                  ✎
                </button>
                <button 
                  className="action-btn del-btn" 
                  onClick={(e) => {e.stopPropagation(); deleteTask(task.id)}}
                >
                  ×
                </button>
              </div>
            </div>

            {expandedNotesId === task.id && (
              <div className="notes-area glass">
                <textarea 
                  autoFocus
                  placeholder="Details about this intention..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  onBlur={() => saveTaskUpdate(task.id, { notes: tempNotes })}
                />
                <div className="notes-footer">
                  <span className="save-hint">Syncs on close or click away</span>
                  <button className="save-close-btn" onClick={() => handleNotesToggle(task)}>Save & Close</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .task-container { padding: 25px; display: flex; flex-direction: column; gap: 20px; }
        .task-header { display: flex; justify-content: space-between; align-items: center; }
        .title-area { display: flex; align-items: center; gap: 15px; }
        h3 { font-size: 1.1rem; letter-spacing: 1px; color: var(--text-primary); margin:0;}
        .sync-badge { font-size: 0.65rem; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

        .clear-btn { background: transparent; border: 1px solid var(--secondary); color: var(--secondary); padding: 5px 12px; border-radius: 10px; font-size: 0.75rem; cursor: pointer; transition: 0.3s; }
        .clear-btn:hover { background: var(--secondary); color: white; }
        
        .task-form { display: flex; gap: 10px; }
        .task-form input { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 14px; border-radius: 14px; color: white; font-family: inherit; }
        .task-form button { width: 48px; background: var(--primary); color: white; border: none; border-radius: 14px; cursor: pointer; font-size: 1.4rem; }

        .tasks-scroll { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px; }
        .task-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 18px; transition: 0.3s; border-left: 4px solid transparent; }
        .task-card:hover { border-color: rgba(255,255,255,0.1); }
        .task-card.is-expanded { border-color: var(--primary); background: rgba(139, 92, 246, 0.05); border-left-color: var(--primary); }

        .task-main { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
        .task-clickable { display: flex; align-items: center; gap: 15px; flex: 1; cursor: pointer; }
        .status-ring { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--glass-border); flex-shrink: 0; position: relative; }
        .is-done .status-ring { background: var(--primary); border-color: var(--primary); }
        .is-done .status-ring::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 12px; }
        
        .task-label { color: var(--text-primary); }
        .is-done .task-label { text-decoration: line-through; color: var(--text-secondary); opacity: 0.5; }
        
        .inline-edit-input { background: transparent; border: none; border-bottom: 2px solid var(--primary); color: white; width: 100%; outline: none; font-family: inherit; font-size: 1rem; }

        .task-actions { display: flex; gap: 4px; opacity: 0.5; }
        .task-card:hover .task-actions, .task-card.is-expanded .task-actions { opacity: 1; }
        
        .action-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 6px; }
        .action-btn:hover { background: rgba(255,255,255,0.08); }
        .note-toggle.has-notes { color: var(--primary); filter: drop-shadow(0 0 5px var(--primary)); }

        .notes-area { margin: 0 16px 16px 16px; padding: 18px; border-radius: 12px; background: rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 10px; border: 1px solid var(--glass-border); }
        .notes-area textarea { background: transparent; border: none; color: var(--text-primary); width: 100%; min-height: 120px; resize: none; outline: none; font-family: inherit; font-size: 0.9rem; line-height: 1.6; }
        .notes-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; border-top: 1px solid var(--glass-border); padding-top: 12px; }
        .save-hint { font-style: italic; opacity: 0.6; }
        .save-close-btn { background: var(--primary); border: none; color: white; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: 0.3s; }
        .save-close-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); }
      `}</style>
    </div>
  );
};

export default TaskList;
