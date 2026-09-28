import { describe, expect, it } from 'vitest'
import { reduceTasks, validateTaskTitle } from '../../src/domain/taskReducer.js'

describe('タスク名の検証', () => {
  it('前後の空白を除去する', () => {
    expect(validateTaskTitle('  牛乳を買う  ')).toEqual({
      ok: true,
      title: '牛乳を買う',
    })
  })

  it.each(['', '   ', '\n\t'])('空文字または空白だけを拒否する: %j', (title) => {
    expect(validateTaskTitle(title)).toEqual({ ok: false, error: 'required' })
  })

  it.each([['1文字', 'あ'], ['200文字', 'あ'.repeat(200)]])(
    '%sを受け付ける',
    (_label, title) => {
      expect(validateTaskTitle(title)).toEqual({ ok: true, title })
    },
  )

  it('Unicodeコードポイントで201文字を拒否する', () => {
    expect(validateTaskTitle('😀'.repeat(201))).toEqual({
      ok: false,
      error: 'too_long',
    })
  })
})

describe('task/add', () => {
  it('未完了のタスクを一覧末尾へ追加し、元の配列を変更しない', () => {
    const originalTask = { id: '1', title: '既存', completed: false }
    const tasks = [originalTask]
    const newTask = { id: '2', title: '牛乳を買う', completed: false }

    const next = reduceTasks(tasks, { type: 'task/add', task: newTask })

    expect(next).toEqual([originalTask, newTask])
    expect(next).not.toBe(tasks)
    expect(tasks).toEqual([originalTask])
  })

  it('同じ名前でも別IDのタスクとして追加できる', () => {
    const tasks = [{ id: '1', title: '牛乳を買う', completed: false }]
    const duplicateTitle = { id: '2', title: '牛乳を買う', completed: false }

    expect(reduceTasks(tasks, { type: 'task/add', task: duplicateTitle })).toEqual([
      tasks[0],
      duplicateTitle,
    ])
  })
})

describe('task/toggle', () => {
  const tasks = [
    { id: '1', title: '最初', completed: false },
    { id: '2', title: '次', completed: true },
  ]

  it('対象IDだけを完了にし、再操作で未完了へ戻す', () => {
    const completed = reduceTasks(tasks, { type: 'task/toggle', id: '1' })
    const restored = reduceTasks(completed, { type: 'task/toggle', id: '1' })

    expect(completed).toEqual([
      { id: '1', title: '最初', completed: true },
      tasks[1],
    ])
    expect(restored).toEqual(tasks)
  })

  it('元の配列とタスクを変更しない', () => {
    const next = reduceTasks(tasks, { type: 'task/toggle', id: '1' })

    expect(next).not.toBe(tasks)
    expect(next[0]).not.toBe(tasks[0])
    expect(next[1]).toBe(tasks[1])
    expect(tasks[0].completed).toBe(false)
  })

  it('未知IDでは同じ配列を返す', () => {
    expect(reduceTasks(tasks, { type: 'task/toggle', id: 'unknown' })).toBe(tasks)
  })
})

describe('task/delete', () => {
  const tasks = [
    { id: '1', title: '同じ名前', completed: false },
    { id: '2', title: '同じ名前', completed: true },
    { id: '3', title: '残す', completed: false },
  ]

  it('同名タスクがあっても対象IDだけを削除する', () => {
    const next = reduceTasks(tasks, { type: 'task/delete', id: '2' })

    expect(next).toEqual([tasks[0], tasks[2]])
    expect(next).not.toBe(tasks)
  })

  it('元の配列と残るタスクを変更しない', () => {
    const next = reduceTasks(tasks, { type: 'task/delete', id: '1' })

    expect(tasks).toHaveLength(3)
    expect(next[0]).toBe(tasks[1])
    expect(next[1]).toBe(tasks[2])
  })

  it('未知IDでは同じ配列を返す', () => {
    expect(reduceTasks(tasks, { type: 'task/delete', id: 'unknown' })).toBe(tasks)
  })
})
