import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import './GanttPage.css';

export default function GanttPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [collapsed, setCollapsed] = useState({ todo: false, inProgress: false, done: false });

  const toggleGroup = (group) => {
    setCollapsed(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Определяем диапазон дат для шкалы (от минимального дедлайна до максимального)
  const dates = tasks.map(t => t.dueDate).filter(Boolean).sort();
  const minDate = dates.length ? new Date(dates[0]) : new Date();
  const maxDate = dates.length ? new Date(dates[dates.length - 1]) : new Date();
  if (dates.length === 0) {
    // если нет задач с дедлайном, показываем текущую неделю
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);
  }
  const startDate = new Date(minDate);
  startDate.setDate(startDate.getDate() - 3); // небольшой отступ слева
  const endDate = new Date(maxDate);
  endDate.setDate(endDate.getDate() + 3); // отступ справа

  // Генерируем недельные интервалы
  const weeks = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({ start: weekStart, end: weekEnd, label: `${weekStart.getDate()}.${weekStart.getMonth()+1}` });
    current.setDate(current.getDate() + 7);
  }

  // Позиция маркера в процентах относительно временной шкалы
  const getMarkerPosition = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));
    const percent = (daysFromStart / totalDays) * 100;
    return { left: `${Math.min(100, Math.max(0, percent))}%` };
  };

  const statusGroups = {
    todo: { title: 'К выполнению', tasks: tasks.filter(t => t.status === 'todo') },
    inProgress: { title: 'В работе', tasks: tasks.filter(t => t.status === 'inProgress') },
    done: { title: 'Готово', tasks: tasks.filter(t => t.status === 'done') },
  };

  return (
    <div>
      <div className="gantt-header">
        <button className="primary" onClick={() => { setCurrentTask(null); setModalOpen(true); }}>+ Создать задачу</button>
      </div>
      <div className="gantt-container">
        <div className="gantt-timeline-header">
          <div className="gantt-group-cell">Группа / Задача</div>
          <div className="gantt-weeks">
            {weeks.map((week, idx) => (
              <div key={idx} className="gantt-week-cell">
                {week.label}
              </div>
            ))}
          </div>
        </div>

        {Object.entries(statusGroups).map(([status, group]) => (
          <div key={status} className="gantt-group">
            <div className="gantt-group-title" onClick={() => toggleGroup(status)}>
              <span className="collapse-icon">{collapsed[status] ? '▶' : '▼'}</span>
              {group.title} ({group.tasks.length})
            </div>
            {!collapsed[status] && group.tasks.map(task => (
              <div key={task.id} className="gantt-task-row" onClick={() => { setCurrentTask(task); setModalOpen(true); }}>
                <div className="gantt-task-name">{task.title}</div>
                <div className="gantt-task-timeline">
                  {task.dueDate && (
                    <div className="gantt-marker" style={getMarkerPosition(task.dueDate)}>
                      <div className="marker-dot" style={{ background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }}></div>
                      <div className="marker-label">{task.dueDate.slice(5)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!collapsed[status] && group.tasks.length === 0 && (
              <div className="gantt-empty-row">Нет задач</div>
            )}
          </div>
        ))}
      </div>
      <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} task={currentTask} onSave={(data) => { currentTask ? updateTask(currentTask.id, data) : addTask(data); setModalOpen(false); }} onDelete={(id) => { deleteTask(id); setModalOpen(false); }} />
    </div>
  );
}