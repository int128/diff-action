import { expect, it } from 'vitest'
import { computeDiff, type Diff, Status } from '../src/diff.js'

it('generates the array of Diff', async () => {
  const diffs = await computeDiff(`${__dirname}/fixtures/base`, `${__dirname}/fixtures/head`)
  expect(diffs).toEqual<Diff[]>([
    {
      basePath: undefined,
      headPath: 'bar.txt',
      status: Status.Added,
      similarityIndex: undefined,
      patch: expect.stringContaining('New file'),
    },
    {
      basePath: 'foo.txt',
      headPath: undefined,
      status: Status.Deleted,
      similarityIndex: undefined,
      patch: expect.stringContaining('This file will be deleted'),
    },
    {
      basePath: 'gateway.yaml',
      headPath: 'httproute.yaml',
      status: Status.Renamed,
      similarityIndex: 100,
      patch: undefined,
    },
    {
      basePath: 'deployment.yaml',
      headPath: 'rollout.yaml',
      status: Status.Renamed,
      similarityIndex: 57,
      patch: expect.stringContaining('@@'),
    },
    {
      basePath: 'service.yaml',
      headPath: 'service.yaml',
      status: Status.Modified,
      similarityIndex: undefined,
      patch: expect.stringContaining('@@'),
    },
  ])
})
