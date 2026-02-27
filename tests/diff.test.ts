import { expect, it } from 'vitest'
import { computeDiff, type Diff, Status } from '../src/diff.js'

it('generates the array of Diff', async () => {
  const diffs = await computeDiff(`${__dirname}/fixtures/base`, `${__dirname}/fixtures/head`)
  expect(diffs).toEqual<Diff[]>([
    {
      basePath: undefined,
      headPath: 'bar.txt',
      status: Status.Added,
      patch: expect.stringContaining('New file'),
    },
    {
      basePath: 'foo.txt',
      headPath: undefined,
      status: Status.Deleted,
      patch: expect.stringContaining('This file will be deleted'),
    },
    {
      basePath: 'gateway.yaml',
      headPath: 'httproute.yaml',
      status: Status.Renamed,
      patch: undefined,
    },
    {
      basePath: 'deployment.yaml',
      headPath: 'rollout.yaml',
      status: Status.Renamed,
      patch: expect.stringContaining('@@'),
    },
    {
      basePath: 'service.yaml',
      headPath: 'service.yaml',
      status: Status.Modified,
      patch: expect.stringContaining('@@'),
    },
  ])
})
