import { useState } from 'react'
import { reduceTasks, validateTaskTitle } from '../domain/taskReducer.js'

function createDefaultId() {
  return globalThis.crypto.randomUUID()
}

export function useTasks({ initialLoad, repository, idFactory = createDefaultId }) {
  const [tasks, setTasks] = useState(initialLoad.tasks)
  const [storageError, setStorageError] = useState(
    initialLoad.ok ? null : initialLoad.error,
  )
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState(null)

  function addTask(rawTitle) {
    const validation = validateTaskTitle(rawTitle)
    if (!validation.ok) return validation

    const task = {
      id: idFactory(),
      title: validation.title,
      completed: false,
    }
    const nextTasks = reduceTasks(tasks, { type: 'task/add', task })
    const result = repository.save(nextTasks)

    if (!result.ok) {
      setStorageError(result.error)
      return result
    }

    setTasks(nextTasks)
    setStorageError(null)
    return { ok: true }
  }

  function toggleTask(id) {
    const nextTasks = reduceTasks(tasks, { type: 'task/toggle', id })
    if (nextTasks === tasks) return { ok: false, error: 'not_found' }

    const result = repository.save(nextTasks)
    if (!result.ok) {
      setStorageError(result.error)
      return result
    }

    setTasks(nextTasks)
    setStorageError(null)
    return { ok: true }
  }

  function requestDelete(id) {
    if (!tasks.some((task) => task.id === id)) return
    setPendingDeleteTaskId(id)
  }

  function cancelDelete() {
    setPendingDeleteTaskId(null)
  }

  function confirmDelete() {
    const nextTasks = reduceTasks(tasks, {
      type: 'task/delete',
      id: pendingDeleteTaskId,
    })
    if (nextTasks === tasks) return { ok: false, error: 'not_found' }

    const result = repository.save(nextTasks)
    if (!result.ok) {
      setStorageError(result.error)
      return result
    }

    setTasks(nextTasks)
    setPendingDeleteTaskId(null)
    setStorageError(null)
    return { ok: true }
  }

  const pendingDeleteTask =
    tasks.find((task) => task.id === pendingDeleteTaskId) ?? null

  return {
    tasks,
    storageError,
    pendingDeleteTask,
    addTask,
    toggleTask,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
