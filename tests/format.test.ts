import { expect, test } from 'vitest'
import { formatComment } from '../src/format.js'
import { Status } from '../src/diff.js'

test('formatComment', () => {
  const comment = formatComment(
    [
      {
        basePath: 'same.yaml',
        headPath: 'same.yaml',
        status: Status.Modified,
        patch: `change`,
      },
      {
        basePath: 'before.yaml',
        headPath: 'after.yaml',
        status: Status.Renamed,
        patch: `rename`,
      },
      {
        basePath: undefined,
        headPath: 'new.yaml',
        status: Status.Added,
        patch: `create`,
      },
      {
        basePath: 'old.yaml',
        headPath: undefined,
        status: Status.Deleted,
        patch: `delete`,
      },
    ],
    {
      workflowRunURL: 'https://github.com/int128/diff-action/actions/runs/6282216330',
    },
  )
  expect(comment).toMatchSnapshot()
})
