import { expect, test } from 'vitest'
import { computeDiff } from '../src/diff.js'

test('diff', async () => {
  const diffs = await computeDiff(`${__dirname}/fixtures/base`, `${__dirname}/fixtures/head`)
  expect(diffs.length).toBe(4)
  expect(diffs[0].baseRelativePath).toBeUndefined()
  expect(diffs[0].headRelativePath).toBe('bar.txt')
  expect(diffs[1].baseRelativePath).toBe('foo.txt')
  expect(diffs[1].headRelativePath).toBeUndefined()
  expect(diffs[2].baseRelativePath).toBe('deployment.yaml')
  expect(diffs[2].headRelativePath).toBe('rollout.yaml')
  expect(diffs[3].baseRelativePath).toBe('service.yaml')
  expect(diffs[3].headRelativePath).toBe('service.yaml')
})
