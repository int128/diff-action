import { expect, test } from 'vitest'
import { Status } from '../src/diff.js'
import { formatComment } from '../src/format.js'

test('formatComment', () => {
  const comment = formatComment(
    [
      {
        basePath: 'same.yaml',
        headPath: 'same.yaml',
        status: Status.Modified,
        similarityIndex: undefined,
        patch: `change`,
      },
      {
        basePath: 'before.yaml',
        headPath: 'after.yaml',
        status: Status.Renamed,
        similarityIndex: 80,
        patch: `rename`,
      },
      {
        basePath: undefined,
        headPath: 'new.yaml',
        status: Status.Added,
        similarityIndex: undefined,
        patch: `create`,
      },
      {
        basePath: 'old.yaml',
        headPath: undefined,
        status: Status.Deleted,
        similarityIndex: undefined,
        patch: `delete`,
      },
    ],
    {
      workflowRunURL: 'https://github.com/int128/diff-action/actions/runs/6282216330',
    },
  )
  expect(comment).toMatchSnapshot()
})
