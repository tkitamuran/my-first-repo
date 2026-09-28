export function validateTaskTitle(rawTitle) {
  const title = rawTitle.trim()
  const length = Array.from(title).length

  if (length === 0) return { ok: false, error: 'required' }
  if (length > 200) return { ok: false, error: 'too_long' }

  return { ok: true, title }
}

export function reduceTasks(tasks, action) {
  if (action.type === 'task/add') {
    return [...tasks, action.task]
  }

  if (action.type === 'task/toggle') {
    if (!tasks.some((task) => task.id === action.id)) return tasks

    return tasks.map((task) =>
      task.id === action.id
        ? { ...task, completed: !task.completed }
        : task,
    )
  }

  if (action.type === 'task/delete') {
    if (!tasks.some((task) => task.id === action.id)) return tasks

    return tasks.filter((task) => task.id !== action.id)
  }

  return tasks
}
