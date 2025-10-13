import { expect, test } from 'vitest'
import { formatComment } from '../src/format.js'

test('formatComment', () => {
  const comment = formatComment(
    [
      {
        baseRelativePath: 'same.yaml',
        headRelativePath: 'same.yaml',
        content: `change`,
      },
      {
        baseRelativePath: 'before.yaml',
        headRelativePath: 'after.yaml',
        content: `rename`,
      },
      {
        baseRelativePath: undefined,
        headRelativePath: 'new.yaml',
        content: `create`,
      },
      {
        baseRelativePath: 'old.yaml',
        headRelativePath: undefined,
        content: `delete`,
      },
    ],
    {
      bodyNoDiff: 'No diff',
      workflowRunURL: 'https://github.com/int128/diff-action/actions/runs/6282216330',
    },
  )
  expect(comment).toMatchSnapshot()
})
