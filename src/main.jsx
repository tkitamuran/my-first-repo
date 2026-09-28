import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { createTaskRepository } from './storage/taskRepository.js'

const repository = createTaskRepository(() => window.localStorage)
const initialLoad = repository.load()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App initialLoad={initialLoad} repository={repository} />
  </React.StrictMode>,
)
