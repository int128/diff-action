import { expect, test } from 'vitest'
import { formatComment } from '../src/format.js'

test('formatComment', () => {
  const comment = formatComment(
    [
      {
        basePath: 'same.yaml',
        headPath: 'same.yaml',
        patch: `change`,
      },
      {
        basePath: 'before.yaml',
        headPath: 'after.yaml',
        patch: `rename`,
      },
      {
        basePath: undefined,
        headPath: 'new.yaml',
        patch: `create`,
      },
      {
        basePath: 'old.yaml',
        headPath: undefined,
        patch: `delete`,
      },
    ],
    {
      workflowRunURL: 'https://github.com/int128/diff-action/actions/runs/6282216330',
    },
  )
  expect(comment).toMatchSnapshot()
})
