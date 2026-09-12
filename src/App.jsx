import { useMemo, useState } from 'react'

const initialTasks = [
  { id: 1, title: '企画書の作成', time: '10:00', category: '仕事', completed: false },
  { id: 2, title: 'メールの返信', time: '12:00', category: '仕事', completed: false },
  { id: 3, title: '買い物に行く', time: '18:00', category: 'プライベート', completed: false },
  { id: 4, title: '読書（30分）', time: '21:00', category: '趣味', completed: false },
]

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" />
      <path d="m19.4 15 .9 1.55-2 2-.01-.01-1.54-.89a7 7 0 0 1-1.75 1.02v1.78h-2.83v-1.78a7 7 0 0 1-1.76-1.02l-1.54.89-2-2L7.76 15a7 7 0 0 1 0-2L6.87 11.45l2-2 1.54.9A7 7 0 0 1 12.17 9V7.22H15V9a7 7 0 0 1 1.75 1.02l1.55-.9 2 2-.9 1.55a7 7 0 0 1 0 2.33Z" transform="translate(-1.58 -1.67) scale(1.13)" />
    </svg>
  )
}

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')

  const remaining = useMemo(() => tasks.filter((task) => !task.completed).length, [tasks])

  const addTask = (event) => {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        category: '新規',
        completed: false,
      },
    ])
    setNewTask('')
  }

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    )
  }

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Todo ホーム">Todo</a>
        <nav className="nav-actions" aria-label="メインメニュー">
          <button className="icon-button active" type="button" aria-label="タスク一覧"><ListIcon /></button>
          <button className="icon-button" type="button" aria-label="カレンダー"><CalendarIcon /></button>
          <button className="icon-button" type="button" aria-label="設定"><SettingsIcon /></button>
        </nav>
      </header>

      <main id="top" className="content">
        <section aria-labelledby="tasks-heading">
          <form className="task-form" onSubmit={addTask}>
            <label className="sr-only" htmlFor="new-task">タスクを入力</label>
            <input
              id="new-task"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="タスクを入力"
              autoComplete="off"
            />
            <button type="submit" disabled={!newTask.trim()}>追加</button>
          </form>

          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR DAY</p>
              <h1 id="tasks-heading">今日のタスク</h1>
            </div>
            <span className="task-count">残り {remaining} 件</span>
          </div>

          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>すべて完了しました</p>
                <span>新しいタスクを追加して一日を始めましょう。</span>
              </div>
            ) : (
              tasks.map((task) => (
                <article className={`task-card${task.completed ? ' completed' : ''}`} key={task.id}>
                  <button
                    className="check-button"
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`${task.title}を${task.completed ? '未完了' : '完了'}にする`}
                    aria-pressed={task.completed}
                  >
                    {task.completed && <span>✓</span>}
                  </button>
                  <div className="task-details">
                    <h2>{task.title}</h2>
                    <div className="task-meta">
                      <span className="date"><CalendarIcon />今日&nbsp; {task.time}</span>
                      <span className={`tag tag-${task.category}`}>{task.category}</span>
                    </div>
                  </div>
                  <button
                    className="more-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`${task.title}を削除`}
                    title="削除"
                  >
                    <span></span><span></span><span></span>
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
