export const TASK_STORAGE_KEY = 'todo-app.tasks.v1'

const STORAGE_VERSION = 1

function isValidTitle(title) {
  return (
    typeof title === 'string' &&
    title === title.trim() &&
    Array.from(title).length >= 1 &&
    Array.from(title).length <= 200
  )
}

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    isValidTitle(task.title) &&
    typeof task.completed === 'boolean'
  )
}

function isValidTasks(tasks) {
  if (!Array.isArray(tasks) || !tasks.every(isValidTask)) return false

  return new Set(tasks.map((task) => task.id)).size === tasks.length
}

function isValidDocument(document) {
  return (
    document !== null &&
    typeof document === 'object' &&
    document.version === STORAGE_VERSION &&
    isValidTasks(document.tasks)
  )
}

export function createTaskRepository(storage, key = TASK_STORAGE_KEY) {
  const getStorage = typeof storage === 'function' ? storage : () => storage

  return {
    load() {
      try {
        const storedValue = getStorage().getItem(key)
        if (storedValue === null) return { ok: true, tasks: [] }

        const document = JSON.parse(storedValue)
        if (!isValidDocument(document)) throw new TypeError('Invalid task document')

        return { ok: true, tasks: document.tasks }
      } catch {
        return { ok: false, tasks: [], error: 'read_failed' }
      }
    },

    save(tasks) {
      try {
        if (!isValidTasks(tasks)) throw new TypeError('Invalid tasks')

        getStorage().setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }))
        return { ok: true }
      } catch {
        return { ok: false, error: 'write_failed' }
      }
    },
  }
}
