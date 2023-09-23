import { getOctokitOptions, GitHub } from '@actions/github/lib/utils'
import * as github from '@actions/github'
import * as pluginRetry from '@octokit/plugin-retry'

type Octokit = InstanceType<typeof GitHub>

const getOctokit = (token: string): Octokit => {
  const MyOctokit = GitHub.plugin(pluginRetry.retry)
  return new MyOctokit(getOctokitOptions(token))
}

export type GitHubContext = {
  octokit: Octokit
  owner: string
  repo: string
  eventName: string
  issueNumber: number
  workflowRunURL: string
}

export const getGitHubContext = (token: string): GitHubContext => ({
  octokit: getOctokit(token),
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  eventName: github.context.eventName,
  issueNumber: github.context.issue.number,
  workflowRunURL: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}`,
})
