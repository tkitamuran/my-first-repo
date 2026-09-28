import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.jsx'
import { createTaskRepository } from '../../src/storage/taskRepository.js'

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
  }
}

describe('初期読込', () => {
  it('保存済みタスクを登録順のまま表示する', () => {
    const repository = createTaskRepository(createMemoryStorage())
    const initialLoad = {
      ok: true,
      tasks: [
        { id: '1', title: '最初のタスク', completed: false },
        { id: '2', title: '次のタスク', completed: true },
      ],
    }

    render(<App initialLoad={initialLoad} repository={repository} />)

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('最初のタスク'),
      expect.stringContaining('次のタスク'),
    ])
  })

  it('読込失敗時は空一覧と日本語エラーを表示する', () => {
    const repository = createTaskRepository(createMemoryStorage())

    render(
      <App
        initialLoad={{ ok: false, tasks: [], error: 'read_failed' }}
        repository={repository}
      />,
    )

    expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      '保存データを読み込めませんでした。新しい一覧として利用できます。',
    )
  })
})

describe('登録の永続化', () => {
  it('登録順を保存し、新しいアプリインスタンスで復元する', async () => {
    const storage = createMemoryStorage()
    const repository = createTaskRepository(storage)
    const user = userEvent.setup()
    const ids = ['1', '2']

    render(
      <App
        initialLoad={repository.load()}
        repository={repository}
        idFactory={() => ids.shift()}
      />,
    )

    const input = screen.getByRole('textbox', { name: 'タスク名' })
    await user.type(input, '最初')
    await user.click(screen.getByRole('button', { name: '追加' }))
    await user.type(input, '次')
    await user.click(screen.getByRole('button', { name: '追加' }))

    cleanup()
    const restoredRepository = createTaskRepository(storage)
    render(
      <App
        initialLoad={restoredRepository.load()}
        repository={restoredRepository}
      />,
    )

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('最初'),
      expect.stringContaining('次'),
    ])
  })

  it('保存失敗時は直前に保存された値を維持する', async () => {
    const previousTasks = [{ id: '1', title: '保存済み', completed: false }]
    const storage = createMemoryStorage()
    const baseRepository = createTaskRepository(storage)
    baseRepository.save(previousTasks)
    const repository = {
      load: () => baseRepository.load(),
      save: () => ({ ok: false, error: 'write_failed' }),
    }
    const user = userEvent.setup()

    render(
      <App
        initialLoad={repository.load()}
        repository={repository}
        idFactory={() => '2'}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'タスク名' }), '未保存')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(baseRepository.load()).toEqual({ ok: true, tasks: previousTasks })
    expect(screen.queryByText('未保存')).not.toBeInTheDocument()
  })
})

describe('完了状態の永続化', () => {
  it('完了と完了解除を保存し、新しいアプリインスタンスで復元する', async () => {
    const storage = createMemoryStorage()
    const repository = createTaskRepository(storage)
    const tasks = [{ id: '1', title: '牛乳を買う', completed: false }]
    repository.save(tasks)
    const user = userEvent.setup()

    const view = render(
      <App initialLoad={repository.load()} repository={repository} />,
    )
    await user.click(
      screen.getByRole('checkbox', { name: '牛乳を買うを完了済みにする' }),
    )

    view.unmount()
    render(<App initialLoad={repository.load()} repository={repository} />)
    const restored = screen.getByRole('checkbox', {
      name: '牛乳を買うを未完了に戻す',
    })
    expect(restored).toBeChecked()

    await user.click(restored)
    cleanup()
    render(<App initialLoad={repository.load()} repository={repository} />)
    expect(
      screen.getByRole('checkbox', { name: '牛乳を買うを完了済みにする' }),
    ).not.toBeChecked()
  })

  it('保存失敗時は表示状態と直前保存値を維持する', async () => {
    const storedTasks = [{ id: '1', title: '保存済み', completed: false }]
    const storage = createMemoryStorage()
    const baseRepository = createTaskRepository(storage)
    baseRepository.save(storedTasks)
    const repository = {
      save: () => ({ ok: false, error: 'write_failed' }),
    }
    const user = userEvent.setup()

    render(
      <App
        initialLoad={{ ok: true, tasks: storedTasks }}
        repository={repository}
      />,
    )
    const checkbox = screen.getByRole('checkbox', {
      name: '保存済みを完了済みにする',
    })
    await user.click(checkbox)

    expect(checkbox).not.toBeChecked()
    expect(baseRepository.load()).toEqual({ ok: true, tasks: storedTasks })
    expect(screen.getByRole('alert')).toHaveTextContent('変更を保存できませんでした。')
  })
})

describe('削除の永続化', () => {
  it('対象だけの削除を保存し、新しいアプリインスタンスでも復元しない', async () => {
    const storage = createMemoryStorage()
    const repository = createTaskRepository(storage)
    repository.save([
      { id: '1', title: '削除する', completed: false },
      { id: '2', title: '残す', completed: false },
    ])
    const user = userEvent.setup()

    render(<App initialLoad={repository.load()} repository={repository} />)
    await user.click(screen.getByRole('button', { name: '削除するを削除' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    cleanup()
    render(<App initialLoad={repository.load()} repository={repository} />)
    expect(screen.queryByText('削除する')).not.toBeInTheDocument()
    expect(screen.getByText('残す')).toBeInTheDocument()
  })

  it('削除の保存失敗時は一覧と直前保存値を維持する', async () => {
    const storedTasks = [{ id: '1', title: '残るタスク', completed: false }]
    const storage = createMemoryStorage()
    const baseRepository = createTaskRepository(storage)
    baseRepository.save(storedTasks)
    const repository = {
      save: () => ({ ok: false, error: 'write_failed' }),
    }
    const user = userEvent.setup()

    render(
      <App
        initialLoad={{ ok: true, tasks: storedTasks }}
        repository={repository}
      />,
    )
    await user.click(screen.getByRole('button', { name: '残るタスクを削除' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(screen.getByText('残るタスク')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(baseRepository.load()).toEqual({ ok: true, tasks: storedTasks })
    expect(screen.getByRole('alert')).toHaveTextContent('変更を保存できませんでした。')
  })
})
