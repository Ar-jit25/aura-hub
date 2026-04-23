import React, { useState, useEffect } from 'react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [subtaskEditingId, setSubtaskEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  
  const [tempText, setTempText] = useState('');
  const [tempSubText, setTempSubText] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
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
    } catch (err) { console.error(err); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, notes: '', subtasks: [] }),
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      setInput('');
    } catch (err) { console.error(err); }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'PATCH' });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); }
    finally { setTimeout(() => setIsSyncing(false), 500); }
  };

  const handleMenuClick = (task) => {
    if (expandedId === task.id) {
      if (activeTab === 'notes') saveTaskUpdate(task.id, { notes: tempNotes });
      setExpandedId(null);
      setActiveTab(null);
    } else {
      setExpandedId(task.id);
      setActiveTab('menu');
      setTempNotes(task.notes || '');
    }
  };

  const addSubtask = (task) => {
    if (!newSubtask.trim()) return;
    const subtasks = [...(task.subtasks || []), { id: Date.now(), text: newSubtask, completed: false }];
    saveTaskUpdate(task.id, { subtasks });
    setNewSubtask('');
  };

  const toggleSubtask = (task, subId) => {
    const subtasks = task.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    saveTaskUpdate(task.id, { subtasks });
  };

  const deleteSubtask = (task, subId) => {
    const subtasks = task.subtasks.filter(s => s.id !== subId);
    saveTaskUpdate(task.id, { subtasks });
  };

  const handleSubtaskEditStart = (sub) => {
    setSubtaskEditingId(sub.id);
    setTempSubText(sub.text);
  };

  const saveSubtaskEdit = (task, subId) => {
    if (!tempSubText.trim()) return setSubtaskEditingId(null);
    const subtasks = task.subtasks.map(s => s.id === subId ? { ...s, text: tempSubText } : s);
    saveTaskUpdate(task.id, { subtasks });
    setSubtaskEditingId(null);
  };

  const handleEditStart = (task) => {
    setEditingId(task.id);
    setTempText(task.text);
  };

  const handleEditSave = (id) => {
    if (tempText.trim()) saveTaskUpdate(id, { text: tempText });
    setEditingId(null);
  };

  const getSubtaskProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    return `${completed}/${task.subtasks.length}`;
  };

  return (
    <div className="task-container glass">
      <div className="task-header">
        <div className="title-area">
          <h3>Daily Intentions</h3>
          {isSyncing && <span className="sync-badge">Saving...</span>}
        </div>
        {tasks.some(t => t.completed) && (
          <button className="clear-btn" onClick={() => fetch(`${API_URL}/completed`, { method: 'DELETE' }).then(fetchTasks)}>Clear Finished</button>
        )}
      </div>
      
      <form onSubmit={addTask} className="task-form">
        <input type="text" placeholder="Add intention..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">+</button>
      </form>

      <div className="tasks-scroll">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.completed ? 'is-done' : ''} ${expandedId === task.id ? 'is-expanded' : ''}`}>
            <div className="task-main">
              <div className="task-clickable" onClick={() => toggleTask(task.id)}>
                <div className="status-ring"></div>
                {editingId === task.id ? (
                  <input autoFocus className="inline-edit-input" value={tempText} onClick={(e) => e.stopPropagation()} onBlur={() => handleEditSave(task.id)} onChange={(e) => setTempText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditSave(task.id)} />
                ) : (
                  <div className="label-group">
                    <span className="task-label">{task.text}</span>
                    {getSubtaskProgress(task) && <span className="progress-pill">{getSubtaskProgress(task)}</span>}
                  </div>
                )}
              </div>

              <div className="task-actions">
                <button className="action-btn menu-btn" onClick={(e) => {e.stopPropagation(); handleMenuClick(task)}}>☰</button>
              </div>
            </div>

            {expandedId === task.id && (
              <div className="utility-panel glass">
                <div className="panel-tabs">
                  <button className={activeTab === 'subtasks' ? 'active' : ''} onClick={() => setActiveTab('subtasks')}>Subtasks</button>
                  <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notes</button>
                  <button className="danger-tab" onClick={() => {fetch(`${API_URL}/${task.id}`, { method: 'DELETE' }).then(fetchTasks)}}>Delete</button>
                </div>

                <div className="panel-body">
                  {activeTab === 'subtasks' && (
                    <div className="subtasks-section">
                      <div className="subtask-add">
                        <input type="text" placeholder="Add step..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubtask(task)} />
                        <button onClick={() => addSubtask(task)}>+</button>
                      </div>
                      <div className="subtask-list">
                        {task.subtasks?.map(sub => (
                          <div key={sub.id} className={`subtask-item ${sub.completed ? 'done' : ''} ${subtaskEditingId === sub.id ? 'editing' : ''}`}>
                            <div className="sub-check" onClick={() => toggleSubtask(task, sub.id)}></div>
                            {subtaskEditingId === sub.id ? (
                              <input 
                                autoFocus
                                className="sub-edit-input"
                                value={tempSubText}
                                onBlur={() => saveSubtaskEdit(task, sub.id)}
                                onChange={(e) => setTempSubText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveSubtaskEdit(task, sub.id)}
                              />
                            ) : (
                              <span className="sub-text">{sub.text}</span>
                            )}
                            <div className="sub-actions">
                              <button className="sub-action edit" onClick={() => handleSubtaskEditStart(sub)}>✎</button>
                              <button className="sub-action del" onClick={() => deleteSubtask(task, sub.id)}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="notes-section">
                      <textarea placeholder="Write your notes here..." value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} onBlur={() => saveTaskUpdate(task.id, { notes: tempNotes })} />
                    </div>
                  )}

                  {activeTab === 'menu' && (
                    <div className="menu-choice">
                      <div className="choice-grid">
                        <button onClick={() => setActiveTab('subtasks')}>📋 Subtasks</button>
                        <button onClick={() => setActiveTab('notes')}>📝 Notes</button>
                        <button onClick={() => handleEditStart(task)}>✎ Rename</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="panel-footer">
                  <button onClick={() => handleMenuClick(task)}>Done</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .task-container { padding: 25px; display: flex; flex-direction: column; gap: 20px; }
        .task-header { display: flex; justify-content: space-between; align-items: center; }
        h3 { font-size: 0.95rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 2px; margin: 0; }
        .sync-badge { font-size: 0.6rem; color: var(--primary); margin-left:10px; opacity: 0.8; }
        
        .task-form { display: flex; gap: 10px; }
        .task-form input { flex:1; background: rgba(255,255,255,0.03); border:1px solid var(--glass-border); padding:14px; border-radius:14px; color:white; outline:none; }
        .task-form button { width:48px; background:var(--primary); color:white; border:none; border-radius:14px; cursor:pointer; font-size:1.4rem; }

        .tasks-scroll { display: flex; flex-direction: column; gap: 12px; max-height: 500px; overflow-y: auto; }
        .task-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 18px; transition: 0.3s; }
        .task-card.is-expanded { border-color: var(--primary); background: rgba(139, 92, 246, 0.03); }

        .task-main { padding: 18px; display: flex; justify-content: space-between; align-items: center; }
        .task-clickable { display: flex; align-items: center; gap: 15px; flex: 1; cursor: pointer; }
        .label-group { display: flex; align-items: center; gap: 12px; }
        .progress-pill { font-size: 0.65rem; background: rgba(139, 92, 246, 0.1); padding: 2px 10px; border-radius: 20px; color: var(--primary); border: 1px solid rgba(139, 92, 246, 0.2); }
        .status-ring { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--glass-border); }
        .is-done .status-ring { background: var(--primary); border-color: var(--primary); }
        .action-btn { background:transparent; border:none; color:var(--text-secondary); cursor:pointer; font-size: 1.2rem; width: 36px; height: 36px; border-radius: 10px; }

        .utility-panel { margin: 0 16px 16px 16px; padding: 0; border-radius: 15px; overflow: hidden; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); }
        .panel-tabs { display: flex; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--glass-border); }
        .panel-tabs button { flex: 1; padding: 12px; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: 0.3s; }
        .panel-tabs button.active { background: rgba(139, 92, 246, 0.1); color: var(--primary); border-bottom: 2px solid var(--primary); }
        .danger-tab { color: var(--secondary) !important; }

        .panel-body { padding: 20px; min-height: 180px; }
        .menu-choice { text-align: center; padding: 10px 0; }
        .choice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .choice-grid button { padding: 20px 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; color: white; font-size: 0.8rem; cursor: pointer; transition: 0.3s; }
        .choice-grid button:hover { background: rgba(255,255,255,0.08); border-color: var(--primary); transform: translateY(-2px); }

        .subtask-add { display: flex; gap: 8px; margin-bottom: 15px; }
        .subtask-add input { flex: 1; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 10px; padding: 10px; color: white; font-size: 0.85rem; outline: none; }
        .subtask-add button { background: var(--primary); border: none; color: white; border-radius: 10px; width: 40px; cursor: pointer; }

        .subtask-list { display: flex; flex-direction: column; gap: 10px; }
        .subtask-item { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: var(--text-secondary); padding: 4px; border-radius: 8px; }
        .sub-check { width: 18px; height: 18px; border: 2px solid var(--glass-border); border-radius: 6px; cursor: pointer; flex-shrink: 0; }
        .sub-text { flex: 1; }
        .sub-edit-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--primary); color: white; font-family: inherit; font-size: 0.9rem; outline: none; }
        .subtask-item.done .sub-text { text-decoration: line-through; opacity: 0.5; }
        .subtask-item.done .sub-check { background: var(--primary); border-color: var(--primary); }
        
        .sub-actions { display: flex; gap: 4px; opacity: 0; transition: 0.2s; }
        .subtask-item:hover .sub-actions { opacity: 1; }
        .sub-action { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: 4px; font-size: 0.9rem; }
        .sub-action:hover { background: rgba(255,255,255,0.05); color: white; }

        .notes-section textarea { width: 100%; min-height: 140px; background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; color: white; font-family: inherit; font-size: 0.9rem; resize: none; outline: none; line-height: 1.6; }
        .panel-footer { display: flex; justify-content: flex-end; padding: 15px 20px; border-top: 1px solid var(--glass-border); }
        .panel-footer button { background: var(--primary); border: none; color: white; padding: 6px 18px; border-radius: 10px; cursor: pointer; font-size: 0.8rem; font-weight: 500; }
        
        .inline-edit-input { background: transparent; border: none; border-bottom: 2px solid var(--primary); color: white; width: 100%; outline: none; font-size: 1rem; font-family: inherit; }
      `}</style>
    </div>
  );
};

export default TaskList;
