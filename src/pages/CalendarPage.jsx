import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import './CalendarPage.css';

export default function CalendarPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay(); // 0 = воскресенье
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const formatDate = (date) => date.toISOString().split('T')[0];
  const isSelected = (date) => formatDate(date) === formatDate(selectedDate);
  const isToday = (date) => formatDate(date) === formatDate(new Date());

  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  // Сдвиг для начала с понедельника (если startDay = 0 воскресенье, то смещаем)
  const startOffset = startDay === 0 ? 6 : startDay - 1;

  const calendarDays = [];
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  const selectedDateStr = formatDate(selectedDate);
  const tasksOnSelected = tasks.filter(task => task.dueDate === selectedDateStr);

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">←</button>
        <span className="month-year">{currentDate.toLocaleString('ru', { month: 'long', year: 'numeric' })}</span>
        <button onClick={nextMonth} className="nav-btn">→</button>
        <button onClick={today} className="today-btn">Сегодня</button>
        <button className="primary" onClick={() => { setCurrentTask(null); setModalOpen(true); }}>+ Новая задача</button>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={idx} className="calendar-day empty"></div>;
          const tasksCount = getTasksForDate(date).length;
          const isSelectedDate = isSelected(date);
          const isCurrentDay = isToday(date);
          return (
            <div
              key={idx}
              className={`calendar-day ${isSelectedDate ? 'selected' : ''} ${isCurrentDay ? 'today' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <div className="day-number">{date.getDate()}</div>
              {tasksCount > 0 && <div className="task-indicator">{tasksCount}</div>}
            </div>
          );
        })}
      </div>

      <div className="selected-date-tasks">
        <h3>Задачи на {selectedDate.toLocaleDateString('ru')}</h3>
        {tasksOnSelected.length === 0 && <p className="no-tasks">Нет задач на эту дату</p>}
        {tasksOnSelected.map(task => (
          <div key={task.id} className="task-item" onClick={() => { setCurrentTask(task); setModalOpen(true); }}>
            <div className="task-title">{task.title}</div>
            <div className="task-meta">
              <span className={`priority priority-${task.priority}`}>
                {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
              </span>
              <span className="status">{task.status === 'todo' ? 'К выполнению' : task.status === 'inProgress' ? 'В работе' : 'Готово'}</span>
            </div>
          </div>
        ))}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={currentTask}
        onSave={(data) => {
          if (currentTask) updateTask(currentTask.id, data);
          else addTask(data);
          setModalOpen(false);
        }}
        onDelete={(id) => { deleteTask(id); setModalOpen(false); }}
      />
    </div>
  );
}