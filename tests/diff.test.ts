import { describe, expect, it } from 'vitest'
import { computeDiff, type Diff, getCanonicalPath, Status } from '../src/diff.js'

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

describe('getCanonicalPath', () => {
  it('returns the canonical path by removing the prefix and the leading segment', () => {
    expect(
      getCanonicalPath(
        'a/path/to/diff-action/tests/fixtures/base/deployment.yaml',
        `/path/to/diff-action/tests/fixtures/base/`,
      ),
    ).toBe('deployment.yaml')
  })

  it('trims the leading / if the canonical path starts with it', () => {
    expect(
      getCanonicalPath(
        'a/path/to/diff-action/tests/fixtures/base/deployment.yaml',
        `/path/to/diff-action/tests/fixtures/base`,
      ),
    ).toBe('deployment.yaml')
  })

  it('returns the filename if the canonical path is empty', () => {
    expect(
      getCanonicalPath(
        'a/path/to/diff-action/tests/fixtures/base/deployment.yaml',
        `/path/to/diff-action/tests/fixtures/base/deployment.yaml`,
      ),
    ).toBe('deployment.yaml')
  })

  it('returns undefined if the raw path does not contain the prefix', () => {
    expect(getCanonicalPath('/dev/null', '/path/to/diff-action/tests/fixtures/base')).toBeUndefined()
  })
})
