import * as core from '@actions/core'
import { GitHubContext } from './github'

export const addComment = async (github: GitHubContext, body: string): Promise<void> => {
  if (!github.issueNumber) {
    core.info(`Ignored non pull request event: ${github.eventName}`)
    return
  }
  const { data } = await github.octokit.rest.issues.createComment({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    body,
  })
  core.info(`Created a comment as ${data.html_url}`)
}
