import { formatComment } from '../src/comment'

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
      header: '## diff',
      footer: '<!-- diff-action -->',
      workflowRunURL: 'https://github.com/int128/diff-action/actions/runs/6282216330',
    },
  )
  expect(comment).toMatchSnapshot()
})
