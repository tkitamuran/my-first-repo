import { useState } from 'react'

const ERROR_MESSAGES = {
  required: 'タスク名を入力してください。',
  too_long: 'タスク名は200文字以内で入力してください。',
}

function TaskForm({ onAdd, inputRef }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const errorId = 'task-title-error'

  function handleChange(event) {
    setValue(event.target.value)
    if (error) setError(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = onAdd(value)

    if (result.ok) {
      setValue('')
      setError(null)
      return
    }

    if (result.error === 'required' || result.error === 'too_long') {
      setError(result.error)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="task-title">タスク名</label>
      <div className="task-form-controls">
        <input
          ref={inputRef}
          id="task-title"
          name="task-title"
          type="text"
          value={value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
        />
        <button type="submit">追加</button>
      </div>
      {error ? (
        <p className="field-error" id={errorId}>
          {ERROR_MESSAGES[error]}
        </p>
      ) : null}
    </form>
  )
}

export default TaskForm
