import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.css'
import './App.css';

import { DataStore, Predicates } from '@aws-amplify/datastore';
import { Task, TaskStatus } from './models';

// import Amplify from '@aws-amplify/core';
// import awsConfig from './aws-exports';
// Amplify.configure(awsConfig);

function TaskItem({ task, toggleTaskStatus, deleteTask }) {
  const status = task.status === TaskStatus.PENDING ? 'Complete' : 'Incomplete';

  return (
    <div className='item'>
      <span className={`task-item-input-${task.status.toLowerCase()}`}>
        {task.name}</span>
      <button className='ui orange basic right floated button'
        onClick={() => deleteTask(task.id)}>X</button>
      <button className='ui orange basic right floated button'
        onClick={() => toggleTaskStatus(task.id)}>{status}</button>
    </div>
  );
}

function TaskForm({ addTask }) {
  const [task, setTask] = useState('');

  const onSubmit = e => {
    e.preventDefault();
    if (!task) return;
    addTask(task);
    setTask('');
  };

  return (
    <form onSubmit={onSubmit}>
      <div className='ui fluid input'>
        <input type='text' placeholder='Type the task name and press enter...'
          value={task} onChange={e => setTask(e.target.value)} />
      </div>
    </form >
  );
}

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    listTasks(setTasks);

    const subscription = DataStore.observe(Task).subscribe(msg => {
      // console.log(msg.model, msg.opType, msg.element);
      console.log(msg.opType, msg.element);
      listTasks(setTasks);
    });

    const handleConnectionChange = () => {
      const condition = navigator.onLine ? 'online' : 'offline';
      console.log(`Go ${condition}...`);
      if (condition === 'online') { listTasks(setTasks); }
    }
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => subscription.unsubscribe();
  }, []);

  const listTasks = async (setTasks, status) => {
    const tasks = !status ? await DataStore.query(Task, Predicates.ALL)
      : await DataStore.query(Task, t => t.status('eq', status));
    setTasks(tasks.sort((a, b) => {
      if (a.status === b.status) return a.name > b.name ? 1 : -1;
      return b.status === TaskStatus.PENDING ? 1 : -1;
    }));
  };

  const addTask = async (name) => {
    const task = new Task({ name, status: TaskStatus.PENDING })
    await DataStore.save(task);
    listTasks(setTasks);
  };

  const toggleTaskStatus = async (id) => {
    const task = await DataStore.query(Task, id);
    await DataStore.save(Task.copyOf(task, t => {
      t.status = t.status === TaskStatus.PENDING
        ? TaskStatus.COMPLETED : TaskStatus.PENDING;
    }));
    listTasks(setTasks);
  };

  const deleteTask = async (id) => {
    const task = await DataStore.query(Task, id);
    await DataStore.delete(task);
    listTasks(setTasks);
  };

  const showAllTasks = () => listTasks(setTasks);
  const showPendingTasks = () => listTasks(setTasks, TaskStatus.PENDING);
  const showCompletedTasks = () => listTasks(setTasks, TaskStatus.COMPLETED);

  const deleteTasks = async (status) => {
    !status ? await DataStore.delete(Task, Predicates.ALL)
      : await DataStore.delete(Task, t => t.status('eq', TaskStatus.COMPLETED));
    listTasks(setTasks);
  }
  const deleteCompletedTasks = () => deleteTasks(TaskStatus.COMPLETED);
  const deleteAllTasks = () => deleteTasks();

  return (
    <div className='ui grid'>
      <div className='sixteen wide column'>
        <div className='ui raised padded text container segment task-container'>
          <h1 className='ui header'>My Tasks</h1>
          <div className='ui divider'></div>
          <div className='ui buttons'>
            <button className='ui orange button'
              onClick={showAllTasks}>Show All</button>
            <div className='or'></div>
            <button className='ui orange button'
              onClick={showPendingTasks}>Show Pending</button>
            <div className='or'></div>
            <button className='ui orange button'
              onClick={showCompletedTasks}>Show Completed</button>
            <div className='or'></div>
            <button className='ui orange button'
              onClick={deleteCompletedTasks}>Delete Completed</button>
            <div className='or'></div>
            <button className='ui orange button'
              onClick={deleteAllTasks}>Delete All</button>
          </div>
          <div className='ui divider'></div>
          <div><TaskForm addTask={addTask} /></div>
          <div className='ui segment'>
            <div className='ui relaxed divided list'>
              {tasks.map((task, index) => (
                <TaskItem key={index} task={task}
                  toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;