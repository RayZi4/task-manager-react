import React from 'react';
import { useTasks } from '../context/TaskContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const { tasks } = useTasks();

  const statusData = [
    { name: 'К выполнению', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'В работе', value: tasks.filter(t => t.status === 'inProgress').length },
    { name: 'Готово', value: tasks.filter(t => t.status === 'done').length },
  ];
  const priorityData = [
    { name: 'Высокий', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Средний', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Низкий', value: tasks.filter(t => t.priority === 'low').length },
  ];
  const assigneeData = [...tasks.reduce((map, t) => {
    if (t.assignee) map.set(t.assignee, (map.get(t.assignee) || 0) + 1);
    return map;
  }, new Map())].map(([name, count]) => ({ name, count }));

  const COLORS_STATUS = ['#6366f1', '#f59e0b', '#10b981'];
  const COLORS_PRIORITY = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Аналитика</h2>
      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Статусы задач</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((_, idx) => <Cell key={idx} fill={COLORS_STATUS[idx]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Приоритеты</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {priorityData.map((_, idx) => <Cell key={idx} fill={COLORS_PRIORITY[idx]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Задачи по исполнителям</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={assigneeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}