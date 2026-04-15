import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const priorityLabel = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
  const statusLabel = { todo: 'К выполнению', inProgress: 'В работе', done: 'Готово' };

  return (
    <div ref={setNodeRef} style={style} className="task-card" {...attributes} {...listeners} onClick={onClick}>
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-description">{task.description}</div>}
      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>{priorityLabel[task.priority]}</span>
        <span className="category">{task.category}</span>
        <span className="assignee">{task.assignee}</span>
      </div>
      <div className="task-footer">
        <span className="status">{statusLabel[task.status]}</span>
        {task.dueDate && <span className="due">📅 {task.dueDate}</span>}
      </div>
    </div>
  );
}