import { describe, expect, it } from 'vitest'
import { createTaskRepository, TASK_STORAGE_KEY } from '../../src/storage/taskRepository.js'

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    snapshot(key = TASK_STORAGE_KEY) {
      return values.get(key)
    },
  }
}

const tasks = [
  { id: 'task-1', title: '牛乳を買う', completed: false },
  { id: 'task-2', title: 'メールを返す', completed: true },
]

describe('taskRepository', () => {
  it('保存データがない場合は空一覧を返す', () => {
    const repository = createTaskRepository(createMemoryStorage())

    expect(repository.load()).toEqual({ ok: true, tasks: [] })
  })

  it('version 1のタスクを登録順のまま復元する', () => {
    const storage = createMemoryStorage({
      [TASK_STORAGE_KEY]: JSON.stringify({ version: 1, tasks }),
    })

    expect(createTaskRepository(storage).load()).toEqual({ ok: true, tasks })
  })

  it.each([
    ['不正JSON', '{'],
    ['未知version', JSON.stringify({ version: 2, tasks: [] })],
    ['tasksが配列ではない', JSON.stringify({ version: 1, tasks: {} })],
    ['フィールド不足', JSON.stringify({ version: 1, tasks: [{ id: '1', title: 'a' }] })],
    ['空のID', JSON.stringify({ version: 1, tasks: [{ id: '', title: 'a', completed: false }] })],
    ['空のタイトル', JSON.stringify({ version: 1, tasks: [{ id: '1', title: '', completed: false }] })],
    ['201文字', JSON.stringify({ version: 1, tasks: [{ id: '1', title: 'あ'.repeat(201), completed: false }] })],
    ['重複ID', JSON.stringify({ version: 1, tasks: [tasks[0], { ...tasks[0], title: '別のタスク' }] })],
  ])('%sを読込エラーとして扱い、保存値を変更しない', (_name, storedValue) => {
    const storage = createMemoryStorage({ [TASK_STORAGE_KEY]: storedValue })

    expect(createTaskRepository(storage).load()).toEqual({
      ok: false,
      tasks: [],
      error: 'read_failed',
    })
    expect(storage.snapshot()).toBe(storedValue)
  })

  it('getItemの例外を読込エラーへ変換する', () => {
    const storage = {
      getItem() {
        throw new DOMException('blocked', 'SecurityError')
      },
      setItem() {},
    }

    expect(createTaskRepository(storage).load()).toEqual({
      ok: false,
      tasks: [],
      error: 'read_failed',
    })
  })

  it('version 1の保存文書を1回で保存する', () => {
    const storage = createMemoryStorage()
    const repository = createTaskRepository(storage)

    expect(repository.save(tasks)).toEqual({ ok: true })
    expect(JSON.parse(storage.snapshot())).toEqual({ version: 1, tasks })
  })

  it('setItemの例外を保存エラーへ変換し、以前の値を維持する', () => {
    const previous = JSON.stringify({ version: 1, tasks: [tasks[0]] })
    const storage = {
      getItem() {
        return previous
      },
      setItem() {
        throw new DOMException('full', 'QuotaExceededError')
      },
    }

    expect(createTaskRepository(storage).save(tasks)).toEqual({
      ok: false,
      error: 'write_failed',
    })
    expect(storage.getItem(TASK_STORAGE_KEY)).toBe(previous)
  })
})
