import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../../src/App.jsx'
import { createTaskRepository } from '../../src/storage/taskRepository.js'

function renderApp({ initialLoad = { ok: true, tasks: [] }, repository, ids } = {}) {
  const actualRepository =
    repository ?? createTaskRepository(window.localStorage)
  const idValues = ids ?? ['task-1', 'task-2', 'task-3']
  const idFactory = vi.fn(() => idValues.shift())

  return {
    user: userEvent.setup(),
    repository: actualRepository,
    idFactory,
    ...render(
      <App
        initialLoad={initialLoad}
        repository={actualRepository}
        idFactory={idFactory}
      />,
    ),
  }
}

describe('タスク登録', () => {
  it('空の一覧と登録フォームを表示する', () => {
    renderApp()

    expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'タスク名' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('前後の空白を除去した未完了タスクを登録順に表示する', async () => {
    const { user } = renderApp()
    const input = screen.getByRole('textbox', { name: 'タスク名' })

    await user.type(input, '  牛乳を買う  ')
    await user.click(screen.getByRole('button', { name: '追加' }))
    await user.type(input, '本を返す')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('牛乳を買う'),
      expect.stringContaining('本を返す'),
    ])
    expect(screen.getAllByText('未完了')).toHaveLength(2)
    expect(input).toHaveValue('')
  })

  it('同名タスクを別タスクとして登録する', async () => {
    const { user, idFactory } = renderApp()
    const input = screen.getByRole('textbox', { name: 'タスク名' })

    await user.type(input, '買い物')
    await user.click(screen.getByRole('button', { name: '追加' }))
    await user.type(input, '買い物')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getAllByText('買い物')).toHaveLength(2)
    expect(idFactory).toHaveBeenCalledTimes(2)
  })

  it('空白だけの入力はエラーにして値を保持する', async () => {
    const { user } = renderApp()
    const input = screen.getByRole('textbox', { name: 'タスク名' })

    await user.type(input, '   ')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getByText('タスク名を入力してください。')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveValue('   ')
  })

  it('201文字を拒否し、200文字を受け付ける', async () => {
    const { user } = renderApp()
    const input = screen.getByRole('textbox', { name: 'タスク名' })

    fireEvent.change(input, { target: { value: 'あ'.repeat(201) } })
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(screen.getByText('タスク名は200文字以内で入力してください。')).toBeInTheDocument()
    expect(input).toHaveValue('あ'.repeat(201))

    await user.clear(input)
    fireEvent.change(input, { target: { value: 'あ'.repeat(200) } })
    await user.click(screen.getByRole('button', { name: '追加' }))
    expect(screen.getByRole('listitem')).toHaveTextContent('あ'.repeat(200))
  })

  it('保存失敗時は入力と一覧を変更せず、エラーを表示する', async () => {
    const repository = {
      save: vi.fn(() => ({ ok: false, error: 'write_failed' })),
    }
    const { user } = renderApp({ repository })
    const input = screen.getByRole('textbox', { name: 'タスク名' })

    await user.type(input, '保存できないタスク')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    expect(input).toHaveValue('保存できないタスク')
    expect(screen.getByRole('alert')).toHaveTextContent('変更を保存できませんでした。')
  })
})

describe('完了状態の切り替え', () => {
  const initialLoad = {
    ok: true,
    tasks: [
      { id: '1', title: '牛乳を買う', completed: false },
      { id: '2', title: '本を返す', completed: false },
    ],
  }

  it('チェック操作で対象だけを完了・未完了へ切り替える', async () => {
    const { user } = renderApp({ initialLoad })
    const checkbox = screen.getByRole('checkbox', {
      name: '牛乳を買うを完了済みにする',
    })

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getAllByText('完了済み')).toHaveLength(1)
    expect(screen.getByText('本を返す').closest('li')).toHaveTextContent('未完了')

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(screen.getAllByText('未完了')).toHaveLength(2)
  })

  it('キーボード操作で切り替えられる', async () => {
    const { user } = renderApp({ initialLoad })
    const checkbox = screen.getByRole('checkbox', {
      name: '牛乳を買うを完了済みにする',
    })

    checkbox.focus()
    await user.keyboard(' ')

    expect(checkbox).toBeChecked()
    expect(checkbox).toHaveAccessibleName('牛乳を買うを未完了に戻す')
  })
})

describe('タスク削除', () => {
  const initialLoad = {
    ok: true,
    tasks: [
      { id: '1', title: '牛乳を買う', completed: false },
      { id: '2', title: '本を返す', completed: false },
    ],
  }

  it('対象名と不可逆性を示し、キャンセルへ初期フォーカスを置く', async () => {
    const { user } = renderApp({ initialLoad })

    await user.click(screen.getByRole('button', { name: '牛乳を買うを削除' }))

    expect(screen.getByRole('dialog', { name: 'タスクを削除しますか？' })).toBeInTheDocument()
    expect(screen.getByText('「牛乳を買う」を削除します。')).toBeInTheDocument()
    expect(screen.getByText('この操作は取り消せません。')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'キャンセル' })).toHaveFocus())
  })

  it('キャンセルとEscapeでは残し、操作元へフォーカスを戻す', async () => {
    const { user } = renderApp({ initialLoad })
    const deleteButton = screen.getByRole('button', { name: '牛乳を買うを削除' })

    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    await waitFor(() => expect(deleteButton).toHaveFocus())

    await user.click(deleteButton)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    await waitFor(() => expect(deleteButton).toHaveFocus())
  })

  it('承認すると対象だけを削除して操作元へフォーカスを戻す', async () => {
    const { user } = renderApp({ initialLoad })
    const deleteButton = screen.getByRole('button', { name: '牛乳を買うを削除' })

    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(screen.queryByText('牛乳を買う')).not.toBeInTheDocument()
    expect(screen.getByText('本を返す')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '本を返すを削除' })).toHaveFocus(),
    )
  })
})
