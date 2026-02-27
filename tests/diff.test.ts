import { expect, it } from 'vitest'
import { computeDiff } from '../src/diff.js'

it('generates the array of Diff', async () => {
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
      baseRelativePath: 'gateway.yaml',
      headRelativePath: 'httproute.yaml',
      patch: expect.stringContaining('similarity index 100%'),
    },
    {
      baseRelativePath: 'deployment.yaml',
      headRelativePath: 'rollout.yaml',
      patch: expect.stringContaining('@@'),
    },
    {
      baseRelativePath: 'service.yaml',
      headRelativePath: 'service.yaml',
      patch: expect.stringContaining('@@'),
    },
  ])
})
