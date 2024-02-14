import * as core from '@actions/core'
import { RequestError } from '@octokit/request-error'
import { GitHubContext } from './github'

export const addLabels = async (github: GitHubContext, labels: string[]): Promise<void> => {
  if (labels.length < 1) {
    return
  }
  if (!github.issueNumber) {
    core.info(`Ignored non pull request event: ${github.eventName}`)
    return
  }

  core.info(`adding labels ${labels.join(', ')} to pull request`)
  const { data: added } = await github.octokit.rest.issues.addLabels({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    labels,
  })
  core.info(`added labels ${added.map((l) => l.name).join(', ')}`)
}

export const removeLabels = async (github: GitHubContext, labels: string[]): Promise<void> => {
  if (labels.length < 1) {
    return
  }
  if (!github.issueNumber) {
    core.info(`Ignored non pull request event: ${github.eventName}`)
    return
  }

  for (const label of labels) {
    core.info(`removing label "${label}" from pull request`)
    try {
      await github.octokit.rest.issues.removeLabel({
        owner: github.owner,
        repo: github.repo,
        issue_number: github.issueNumber,
        name: label,
      })
      core.info(`removed label ${label}`)
    } catch (error) {
      if (error instanceof RequestError && error.status === 404) {
        core.info(`skip removing label ${label}`)
        continue
      }
      throw error
    }
  }
}
