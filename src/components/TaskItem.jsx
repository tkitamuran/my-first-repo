function TaskItem({ task, onToggle, onDeleteRequest }) {
  const actionLabel = task.completed
    ? `${task.title}を未完了に戻す`
    : `${task.title}を完了済みにする`

  return (
    <li className={`task-card${task.completed ? ' task-card-completed' : ''}`}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={actionLabel}
        />
        <span aria-hidden="true" />
      </label>
      <span className="task-title">{task.title}</span>
      <span className="task-status">{task.completed ? '完了済み' : '未完了'}</span>
      <button
        className="delete-button"
        type="button"
        aria-label={`${task.title}を削除`}
        data-delete-button
        onClick={(event) => onDeleteRequest(task.id, event.currentTarget)}
      >
        削除
      </button>
    </li>
  )
}

export default TaskItem
