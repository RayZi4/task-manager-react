import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';

export default function StatsPage() {
  const navigate = useNavigate();
  const { tasks, COLUMNS } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).length;
    const completionRate = total === 0 ? 0 : Math.round((doneCount / total) * 100);
    
    const priorityData = [
      { name: 'Высокий', value: highPriority, color: '#f97316' },
      { name: 'Средний', value: mediumPriority, color: '#eab308' },
      { name: 'Низкий', value: lowPriority, color: '#22c55e' }
    ];
    
    return { total, todoCount, inProgressCount, doneCount, highPriority, mediumPriority, lowPriority, overdue, completionRate, priorityData };
  }, [tasks]);

  const getConicGradient = () => {
    const { priorityData } = stats;
    let totalPriority = priorityData.reduce((sum, p) => sum + p.value, 0);
    if (totalPriority === 0) return 'conic-gradient(#e2e8f0 0deg 360deg)';
    let start = 0;
    const segments = [];
    priorityData.forEach(p => {
      const deg = (p.value / totalPriority) * 360;
      segments.push(`${p.color} ${start}deg ${start + deg}deg`);
      start += deg;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Статистика</h1>
        <button className="secondary" onClick={handleBack}>
          ← Назад
        </button>
      </div>

      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-label">Всего</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-label">К выполнению</span>
            <span className="stat-value">{stats.todoCount}</span>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <span className="stat-label">В работе</span>
            <span className="stat-value">{stats.inProgressCount}</span>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon">✔️</div>
          <div className="stat-info">
            <span className="stat-label">Готово</span>
            <span className="stat-value">{stats.doneCount}</span>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-label">Просрочено</span>
            <span className="stat-value">{stats.overdue}</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h3>Общий прогресс</h3>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${stats.completionRate}%` }}></div>
        </div>
        <div className="progress-stats">
          <span>Выполнено {stats.doneCount} из {stats.total}</span>
          <span className="completion-percent">{stats.completionRate}%</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Приоритеты</h3>
          <div className="pie-chart" style={{ background: getConicGradient() }}></div>
          <div className="pie-legend">
            {stats.priorityData.map(p => (
              <div key={p.name} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: p.color }}></span>
                <span>{p.name}: {p.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Статусы</h3>
          <div className="status-bars">
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span>{COLUMNS.todo}</span>
                <span>{stats.todoCount}</span>
              </div>
              <div className="status-bar-bg">
                <div className="status-bar-fill todo-fill" style={{ width: `${stats.total ? (stats.todoCount / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span>{COLUMNS.inProgress}</span>
                <span>{stats.inProgressCount}</span>
              </div>
              <div className="status-bar-bg">
                <div className="status-bar-fill progress-fill" style={{ width: `${stats.total ? (stats.inProgressCount / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="status-bar-item">
              <div className="status-bar-label">
                <span>{COLUMNS.done}</span>
                <span>{stats.doneCount}</span>
              </div>
              <div className="status-bar-bg">
                <div className="status-bar-fill done-fill" style={{ width: `${stats.total ? (stats.doneCount / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tasks.some(t => t.category) && (
        <div className="chart-card categories-card">
          <h3>Категории</h3>
          <div className="categories-list">
            {Object.entries(
              tasks.reduce((acc, t) => {
                if (t.category) acc[t.category] = (acc[t.category] || 0) + 1;
                return acc;
              }, {})
            ).sort((a,b) => b[1] - a[1]).slice(0,5).map(([cat, count]) => (
              <div key={cat} className="category-item">
                <span>{cat}</span>
                <span className="category-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}