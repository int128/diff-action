import { expect, test } from 'vitest'
import { computeDiff } from '../src/diff.js'

test('diff', async () => {
  const diffs = await computeDiff(`${__dirname}/fixtures/base`, `${__dirname}/fixtures/head`)
  expect(diffs).toEqual([
    {
      baseRelativePath: undefined,
      headRelativePath: 'bar.txt',
      patch: expect.stringContaining('/dev/null'),
    },
    {
      baseRelativePath: 'foo.txt',
      headRelativePath: undefined,
      patch: expect.stringContaining('/dev/null'),
    },
    {
      baseRelativePath: 'service.yaml',
      headRelativePath: 'http.yaml',
      patch: expect.stringContaining('rename from'),
    },
    {
      baseRelativePath: 'deployment.yaml',
      headRelativePath: 'rollout.yaml',
      patch: expect.stringContaining('@@'),
    },
  ])
})
