import { comment } from '../src/comment'
import { diff } from '../src/diff'
import { GitHub } from '@actions/github/lib/utils'

type Octokit = InstanceType<typeof GitHub>

type CommentOptions = {
  header: string
  footer: string
}

const comment = async (octokit: Octokit, diffs: diff[], o: CommentOptions): Promise<void> => {
  // ...
}

const test = async () => {
  // Create a mock Octokit client.
  const octokit = new GitHub({
    token: 'my-token',
  })

  // Create a mock diff object.
  const diff = new diff({
    headRelativePath: 'new-file.txt',
    baseRelativePath: undefined,
    content: '`diff\n+ This is a new file.\n`',
  })

  // Create a CommentOptions object.
  const o = {
    header: 'This is a comment header',
    footer: 'This is a comment footer',
  }

  // Call the `comment` function.
  await comment(octokit, [diff], o)

  // Check that the comment was created.
  const comments = await octokit.rest.issues.getComments({
    owner: 'octocat',
    repo: 'octocat/hello-world',
    issue_number: 1,
  })

  expect(comments).toHaveLength(1)
  expect(comments[0].body).toMatch(/This is a comment header/)
  expect(comments[0].body).toMatch(/This is a new file./)
}

test()
