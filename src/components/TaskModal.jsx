import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import './TaskModal.css';

export default function TaskModal({ task, isOpen, onClose, onSave, onDelete }) {
  const { addSubtask, toggleSubtask, deleteSubtask, addComment, deleteComment } = useTasks();
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', category: '', dueDate: '', status: 'todo', assignee: ''
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task) setForm(task);
    else setForm({ title: '', description: '', priority: 'medium', category: '', dueDate: '', status: 'todo', assignee: '' });
  }, [task]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  const handleAddSubtask = () => {
    if (newSubtask.trim() && task) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && task) {
      addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{task ? 'Редактировать задачу' : 'Новая задача'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Название *</label>
          <input name="title" placeholder="Краткое название задачи" value={form.title} onChange={handleChange} required />

          <label>Описание</label>
          <textarea name="description" placeholder="Подробное описание" rows="3" value={form.description} onChange={handleChange} />

          <label>Приоритет</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option>
          </select>

          <label>Категория</label>
          <input name="category" placeholder="Работа, Личное, Учёба" value={form.category} onChange={handleChange} />

          <label>Дедлайн (срок выполнения)</label>
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />

          <label>Статус</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">К выполнению</option><option value="inProgress">В работе</option><option value="done">Готово</option>
          </select>

          <label>Исполнитель</label>
          <input name="assignee" placeholder="Кто выполняет задачу" value={form.assignee} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit" className="primary">Сохранить</button>
            {task && <button type="button" className="danger" onClick={() => onDelete(task.id)}>Удалить</button>}
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>

        {task && (
          <>
            <hr className="modal-divider" />
            <div className="subtasks-section">
              <h4>Подзадачи</h4>
              <div className="subtasks-list">
                {task.subtasks?.map(st => (
                  <div key={st.id} className="subtask-item">
                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(task.id, st.id)} />
                    <span className={st.completed ? 'completed' : ''}>{st.text}</span>
                    <button type="button" className="icon-btn" onClick={() => deleteSubtask(task.id, st.id)}>🗑️</button>
                  </div>
                ))}
              </div>
              <div className="add-subtask">
                <input type="text" placeholder="Новая подзадача" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
                <button type="button" onClick={handleAddSubtask}>+</button>
              </div>
            </div>

            <hr className="modal-divider" />
            <div className="comments-section">
              <h4>Комментарии</h4>
              <div className="comments-list">
                {task.comments?.map(c => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{c.author}</strong> <span>{c.date}</span>
                      <button type="button" className="icon-btn" onClick={() => deleteComment(task.id, c.id)}>🗑️</button>
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                ))}
              </div>
              <div className="add-comment">
                <textarea placeholder="Написать комментарий..." rows="2" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button type="button" onClick={handleAddComment}>Добавить</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}