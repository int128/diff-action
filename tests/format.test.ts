import { expect, test } from 'vitest'
import { formatComment } from '../src/format.js'

test('formatComment', () => {
  const comment = formatComment(
    [
      {
        baseRelativePath: 'same.yaml',
        headRelativePath: 'same.yaml',
        patch: `change`,
      },
      {
        baseRelativePath: 'before.yaml',
        headRelativePath: 'after.yaml',
        patch: `rename`,
      },
      {
        baseRelativePath: undefined,
        headRelativePath: 'new.yaml',
        patch: `create`,
      },
      {
        baseRelativePath: 'old.yaml',
        headRelativePath: undefined,
        patch: `delete`,
      },
    ],
    {
      workflowRunURL: 'https://github.com/int128/diff-action/actions/runs/6282216330',
    },
  )
  expect(comment).toMatchSnapshot()
})
