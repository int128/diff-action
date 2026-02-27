import { expect, it } from 'vitest'
import { computeDiff, type Diff } from '../src/diff.js'

it('generates the array of Diff', async () => {
  const diffs = await computeDiff(`${__dirname}/fixtures/base`, `${__dirname}/fixtures/head`)
  expect(diffs).toEqual<Diff[]>([
    {
      basePath: undefined,
      headPath: 'bar.txt',
      patch: expect.stringContaining('/dev/null'),
    },
    {
      basePath: 'foo.txt',
      headPath: undefined,
      patch: expect.stringContaining('/dev/null'),
    },
    {
      basePath: 'gateway.yaml',
      headPath: 'httproute.yaml',
      patch: expect.stringContaining('similarity index 100%'),
    },
    {
      basePath: 'deployment.yaml',
      headPath: 'rollout.yaml',
      patch: expect.stringContaining('@@'),
    },
    {
      basePath: 'service.yaml',
      headPath: 'service.yaml',
      patch: expect.stringContaining('@@'),
    },
  ])
})
