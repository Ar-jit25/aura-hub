import React, { useState, useEffect } from 'react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [tempNotes, setTempNotes] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const API_URL = 'http://localhost:5000/api/tasks';

  // Helper to get auth headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('aura_token')}`
  });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      if (res.status === 401) return window.location.reload(); // Session expired
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text: input, notes: '', subtasks: [] }),
      });
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      setInput('');
    } catch (err) { console.error(err); }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'PATCH',
        headers: getHeaders()
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t._id === id ? updatedTask : t));
    } catch (err) { console.error(err); }
  };

  const saveTaskUpdate = async (id, payload) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t._id === id ? updatedTask : t));
    } catch (err) { console.error(err); }
    finally { setTimeout(() => setIsSyncing(false), 500); }
  };

  const handleMenuClick = (task) => {
    if (expandedId === task._id) {
      if (activeTab === 'notes') saveTaskUpdate(task._id, { notes: tempNotes });
      setExpandedId(null); setActiveTab(null);
    } else {
      setExpandedId(task._id); setActiveTab('menu'); setTempNotes(task.notes || '');
    }
  };

  const addSubtask = (task) => {
    if (!newSubtask.trim()) return;
    const subtasks = [...(task.subtasks || []), { text: newSubtask, completed: false }];
    saveTaskUpdate(task._id, { subtasks }); setNewSubtask('');
  };

  const toggleSubtask = (task, subId) => {
    const subtasks = task.subtasks.map(s => s._id === subId ? { ...s, completed: !s.completed } : s);
    saveTaskUpdate(task._id, { subtasks });
  };

  const deleteSubtask = (task, subId) => {
    const subtasks = task.subtasks.filter(s => s._id !== subId);
    saveTaskUpdate(task._id, { subtasks });
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE', 
        headers: getHeaders() 
      });
      setTasks(prev => prev.filter(t => t._id !== id));
      setExpandedId(null);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="intentions-tower">
      <header className="tower-header">
        <div className="title-row">
          <h2>Intentions</h2>
          {isSyncing && <div className="sync-glow"></div>}
        </div>
        <form onSubmit={addTask} className="tower-form">
          <input type="text" placeholder="New focus..." value={input} onChange={(e) => setInput(e.target.value)} />
          <button type="submit">+</button>
        </form>
      </header>

      <div className="tower-scroll">
        {tasks.map(task => (
          <div key={task._id} className={`tower-card ${task.completed ? 'is-done' : ''} ${expandedId === task._id ? 'is-active' : ''}`}>
            <div className="card-top">
              <div className="check-box" onClick={(e) => { e.stopPropagation(); toggleTask(task._id); }}>
                {task.completed && <span>✓</span>}
              </div>
              <div className="task-info" onClick={() => handleMenuClick(task)}>
                <span className="task-text">{task.text}</span>
                {task.subtasks?.length > 0 && (
                  <span className="sub-count">
                    {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} STEPS
                  </span>
                )}
              </div>
              <button className="dots-btn" onClick={() => handleMenuClick(task)}>☰</button>
            </div>

            {expandedId === task._id && (
              <div className="card-expansion">
                <div className="tab-menu">
                  <button className={activeTab === 'subtasks' ? 'on' : ''} onClick={() => setActiveTab('subtasks')}>Steps</button>
                  <button className={activeTab === 'notes' ? 'on' : ''} onClick={() => setActiveTab('notes')}>Notes</button>
                </div>
                
                {activeTab === 'subtasks' && (
                  <div className="sub-section">
                    <div className="sub-input">
                      <input type="text" placeholder="Add step..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubtask(task)} />
                    </div>
                    {task.subtasks?.map(sub => (
                      <div key={sub._id} className={`sub-row ${sub.completed ? 'done' : ''}`}>
                        <div className="mini-check" onClick={() => toggleSubtask(task, sub._id)}></div>
                        <span>{sub.text}</span>
                        <button onClick={() => deleteSubtask(task, sub._id)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="note-section">
                    <textarea value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} placeholder="Thoughts..." />
                  </div>
                )}

                {activeTab === 'menu' && (
                  <div className="quick-menu">
                    <button onClick={() => setActiveTab('subtasks')}>📋 Manage Steps</button>
                    <button onClick={() => setActiveTab('notes')}>📝 View Notes</button>
                    <button className="del-btn" onClick={() => deleteTask(task._id)}>× Delete Task</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .intentions-tower { display: flex; flex-direction: column; height: 100%; background: rgba(0,0,0,0.2); }
        .tower-header { padding: 25px; border-bottom: 1px solid var(--glass-border); }
        .title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        h2 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 4px; color: var(--text-dim); }
        .sync-glow { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 10px var(--primary); animation: pulse 1s infinite; }
        .tower-form { display: flex; gap: 8px; }
        .tower-form input { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 10px 15px; border-radius: 10px; color: white; outline: none; font-size: 0.9rem; }
        .tower-form button { width: 38px; background: var(--primary); border: none; border-radius: 10px; color: white; cursor: pointer; }
        .tower-scroll { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; padding-bottom: 40px; }
        .tower-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 16px; transition: 0.3s; overflow: hidden; }
        .tower-card.is-active { background: rgba(255,255,255,0.05); border-color: var(--primary); }
        .card-top { padding: 15px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .check-box { width: 20px; height: 20px; border: 2.5px solid var(--glass-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--primary); }
        .is-done .check-box { background: var(--primary); border-color: var(--primary); color: white; }
        .task-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .task-text { font-size: 0.95rem; color: white; }
        .is-done .task-text { text-decoration: line-through; opacity: 0.5; }
        .sub-count { font-size: 0.55rem; letter-spacing: 1px; color: var(--primary); font-weight: 700; }
        .dots-btn { background: transparent; border: none; color: var(--text-dim); cursor: pointer; }
        .card-expansion { border-top: 1px solid var(--glass-border); padding: 15px; background: rgba(0,0,0,0.2); }
        .tab-menu { display: flex; gap: 8px; margin-bottom: 15px; }
        .tab-menu button { flex: 1; background: transparent; border: 1px solid var(--glass-border); padding: 6px; border-radius: 8px; color: var(--text-dim); font-size: 0.7rem; cursor: pointer; }
        .tab-menu button.on { border-color: var(--primary); color: white; background: rgba(192, 132, 252, 0.1); }
        .sub-row { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; }
        .mini-check { width: 14px; height: 14px; border: 1px solid var(--glass-border); border-radius: 4px; }
        .sub-row.done .mini-check { background: var(--primary); border: none; }
        .sub-row button { margin-left: auto; background: transparent; border: none; color: var(--text-dim); cursor: pointer; }
        .note-section textarea { width: 100%; min-height: 100px; background: transparent; border: none; color: white; resize: none; outline: none; font-size: 0.85rem; }
        .quick-menu { display: flex; flex-direction: column; gap: 6px; }
        .quick-menu button { text-align: left; background: rgba(255,255,255,0.03); border: none; padding: 10px; border-radius: 8px; color: white; cursor: pointer; font-size: 0.8rem; }
        .del-btn { color: var(--secondary) !important; margin-top: 15px; }
      `}</style>
    </div>
  );
};

export default TaskList;
