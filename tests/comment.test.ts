import { comment } from '../src/comment'
import { Diff } from '../src/diff'
import { GitHub } from '@actions/github/lib/utils'

type Octokit = InstanceType<typeof GitHub>

type CommentOptions = {
  header: string
  footer: string
}

describe("comment function", () => {
  it('should create a comment', async () => {
    // Create a mock Octokit client.
    const octokit = new GitHub({
      token: 'my-token',
    })

    // Create a mock diff object.
    const mockDiff = new Diff({
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
    await comment(octokit, [mockDiff], o)

    // Check that the comment was created.
    let comments;
    try {
      comments = await octokit.rest.issues.getComments({
        owner: 'octocat',
        repo: 'octocat/hello-world',
        issue_number: 1,
      })
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(comments.data).toHaveLength(1)
    expect(comments.data[0].body).toMatch(/This is a comment header/)
    expect(comments.data[0].body).toMatch(/This is a new file./)
  });
});
