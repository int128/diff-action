import * as core from '@actions/core'
import { GitHubContext } from './github'

export const addComment = async (github: GitHubContext, body: string): Promise<void> => {
  if (github.eventName !== 'pull_request') {
    core.info(`ignore non pull-request event: ${github.eventName}`)
    return
  }
  const { data } = await github.octokit.rest.issues.createComment({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    body,
  })
  core.info(`created a comment as ${data.html_url}`)
}
