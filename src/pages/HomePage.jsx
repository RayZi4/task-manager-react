import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import './HomePage.css';

export default function HomePage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      updateTask(parseInt(active.id), { status: over?.id });
      showToast('Статус задачи изменён', 'success');
    }
  };

  // Получаем уникальные категории и исполнителей для фильтров
  const categories = ['all', ...new Set(tasks.map(t => t.category).filter(Boolean))];
  const assignees = ['all', ...new Set(tasks.map(t => t.assignee).filter(Boolean))];

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'active' && task.status === 'done') return false;
    if (filterStatus === 'completed' && task.status !== 'done') return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterAssignee !== 'all' && task.assignee !== filterAssignee) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(query) || 
             (task.description && task.description.toLowerCase().includes(query));
    }
    return true;
  });

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  const columns = { todo: 'К выполнению', inProgress: 'В работе', done: 'Готово' };

  // Прогресс выполнения
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Экспорт
  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Экспорт выполнен', 'success');
  };

  // Импорт
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) {
          imported.forEach(task => {
            if (!task.id) task.id = Date.now() + Math.random();
            addTask(task);
          });
          showToast('Импорт завершён', 'success');
        } else throw new Error();
      } catch {
        showToast('Ошибка: неверный формат JSON', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="board-header">
        <div className="progress-section">
          <div className="progress-label">Общий прогресс: {progressPercent}%</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="action-buttons">
          <button className="primary" onClick={() => { setCurrentTask(null); setModalOpen(true); }}>+ Создать задачу</button>
          <button onClick={handleExport} className="secondary">📤 Экспорт</button>
          <label className="secondary import-btn">
            📥 Импорт
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">Все приоритеты</option>
          <option value="high">Высокий</option><option value="medium">Средний</option><option value="low">Низкий</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'Все категории' : cat}</option>)}
        </select>
        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          {assignees.map(ass => <option key={ass} value={ass}>{ass === 'all' ? 'Все исполнители' : ass}</option>)}
        </select>
        <div className="status-filters">
          <button onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'active' : ''}>Все</button>
          <button onClick={() => setFilterStatus('active')} className={filterStatus === 'active' ? 'active' : ''}>Активные</button>
          <button onClick={() => setFilterStatus('completed')} className={filterStatus === 'completed' ? 'active' : ''}>Выполненные</button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {Object.entries(columns).map(([status, title]) => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <span>{title}</span>
                <span className="count">{getTasksByStatus(status).length}</span>
              </div>
              <SortableContext items={getTasksByStatus(status).map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div>
                  {getTasksByStatus(status).map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => { setCurrentTask(task); setModalOpen(true); }} />
                  ))}
                  {getTasksByStatus(status).length === 0 && <div className="empty-column">Нет задач</div>}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={currentTask}
        onSave={(data) => {
          if (currentTask) {
            updateTask(currentTask.id, data);
            showToast('Задача обновлена', 'success');
          } else {
            addTask(data);
            showToast('Задача создана', 'success');
          }
          setModalOpen(false);
        }}
        onDelete={(id) => {
          deleteTask(id);
          showToast('Задача удалена', 'error');
          setModalOpen(false);
        }}
      />
    </div>
  );
}