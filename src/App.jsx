import { useRef } from 'react'
import DeleteTaskDialog from './components/DeleteTaskDialog.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import { useTasks } from './hooks/useTasks.js'

function App({ initialLoad = { ok: true, tasks: [] }, repository, idFactory }) {
  const {
    tasks,
    storageError,
    pendingDeleteTask,
    addTask,
    toggleTask,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useTasks({
    initialLoad,
    repository,
    idFactory,
  })
  const deleteTriggerRef = useRef(null)
  const taskInputRef = useRef(null)

  function restoreDeleteFocus(preferOriginal = true) {
    window.setTimeout(() => {
      if (preferOriginal && deleteTriggerRef.current?.isConnected) {
        deleteTriggerRef.current.focus()
        return
      }

      const remainingDeleteButton = document.querySelector('[data-delete-button]')
      if (remainingDeleteButton) {
        remainingDeleteButton.focus()
        return
      }

      taskInputRef.current?.focus()
    }, 0)
  }

  function handleDeleteRequest(id, trigger) {
    deleteTriggerRef.current = trigger
    requestDelete(id)
  }

  function handleDeleteCancel() {
    cancelDelete()
    restoreDeleteFocus()
  }

  function handleDeleteConfirm() {
    const result = confirmDelete()
    if (result.ok) restoreDeleteFocus(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">ToDo</span>
      </header>

      <main className="content">
        <section className="composer" aria-labelledby="add-task-heading">
          <p className="eyebrow">NEW TASK</p>
          <h1 id="add-task-heading">今日やることを追加</h1>
          <TaskForm onAdd={addTask} inputRef={taskInputRef} />
        </section>

        <section aria-labelledby="tasks-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MY TASKS</p>
              <h2 id="tasks-heading">タスク一覧</h2>
            </div>
            <span className="task-count">{tasks.length}件</span>
          </div>

          <StatusMessage error={storageError} />
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onDeleteRequest={handleDeleteRequest}
          />
        </section>
      </main>

      {pendingDeleteTask ? (
        <DeleteTaskDialog
          task={pendingDeleteTask}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  )
}

export default App
