import React from 'react';
import './TaskItem.css';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-check">
        <input 
          type="checkbox" 
          checked={task.completed} 
          onChange={onToggle} 
        />
      </div>
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`priority ${task.priority}`}>
            Приоритет: {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
          </span>
          {task.dueDate && <span>Дедлайн: {task.dueDate}</span>}
          {task.category && <span>Категория: {task.category}</span>}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={onEdit} className="edit-btn">✏️</button>
        <button onClick={onDelete} className="delete-btn">🗑️</button>
      </div>
    </div>
  );
}