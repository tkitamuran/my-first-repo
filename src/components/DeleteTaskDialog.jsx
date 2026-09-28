import { useEffect, useRef } from 'react'

function DeleteTaskDialog({ task, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    cancelRef.current?.focus()
  }, [])

  function handleCancel(event) {
    event?.preventDefault()
    onCancel()
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') handleCancel(event)
  }

  return (
    <dialog
      ref={dialogRef}
      className="delete-dialog"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
    >
      <h2 id="delete-dialog-title">タスクを削除しますか？</h2>
      <div id="delete-dialog-description">
        <p>「{task.title}」を削除します。</p>
        <p className="delete-warning">この操作は取り消せません。</p>
      </div>
      <div className="dialog-actions">
        <button ref={cancelRef} type="button" onClick={handleCancel}>
          キャンセル
        </button>
        <button className="danger-button" type="button" onClick={onConfirm}>
          削除する
        </button>
      </div>
    </dialog>
  )
}

export default DeleteTaskDialog
