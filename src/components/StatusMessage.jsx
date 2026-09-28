const ERROR_MESSAGES = {
  read_failed: '保存データを読み込めませんでした。新しい一覧として利用できます。',
  write_failed: '変更を保存できませんでした。入力内容を確認して、もう一度お試しください。',
}

function StatusMessage({ error }) {
  if (!error) return null

  return (
    <p className="status-message status-message-error" role="alert">
      {ERROR_MESSAGES[error] ?? '処理を完了できませんでした。もう一度お試しください。'}
    </p>
  )
}

export default StatusMessage
