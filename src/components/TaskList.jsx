import TaskItem from './TaskItem.jsx'

function TaskList({ tasks, onToggle, onDeleteRequest }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>タスクがありません</p>
        <span>最初のタスクを追加してみましょう。</span>
      </div>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          task={task}
          onToggle={onToggle}
          onDeleteRequest={onDeleteRequest}
          key={task.id}
        />
      ))}
    </ul>
  )
}

export default TaskList
