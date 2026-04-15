import React, { createContext, useState, useContext, useEffect } from 'react';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('weeek_tasks');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: 1, title: 'Изучить React', description: 'Понять хуки и контекст', 
        priority: 'high', category: 'Обучение', dueDate: '2025-05-20', 
        status: 'todo', assignee: 'Анна', createdAt: '2025-05-01',
        subtasks: [
          { id: 101, text: 'Посмотреть видео про хуки', completed: true },
          { id: 102, text: 'Написать небольшой проект', completed: false }
        ],
        comments: [
          { id: 1001, text: 'Нужно уложиться до пятницы', author: 'Анна', date: '2025-05-02' }
        ]
      },
      // ... остальные задачи можно оставить без подзадач
    ];
  });

  useEffect(() => {
    localStorage.setItem('weeek_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData) => {
    const newTask = { 
      ...taskData, 
      id: Date.now(), 
      createdAt: new Date().toISOString().slice(0,10),
      subtasks: taskData.subtasks || [],
      comments: taskData.comments || []
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id, updatedData) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedData } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addSubtask = (taskId, subtaskText) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      const newSubtask = { id: Date.now(), text: subtaskText, completed: false };
      return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      const newSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      return { ...task, subtasks: newSubtasks };
    }));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      return { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) };
    }));
  };

  const addComment = (taskId, commentText, author = 'Я') => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      const newComment = { 
        id: Date.now(), 
        text: commentText, 
        author, 
        date: new Date().toISOString().slice(0,10) 
      };
      return { ...task, comments: [...(task.comments || []), newComment] };
    }));
  };

  const deleteComment = (taskId, commentId) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      return { ...task, comments: task.comments.filter(c => c.id !== commentId) };
    }));
  };

  const value = {
    tasks, addTask, updateTask, deleteTask,
    addSubtask, toggleSubtask, deleteSubtask,
    addComment, deleteComment
  };
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
}