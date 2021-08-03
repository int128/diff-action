import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { RequestError } from '@octokit/request-error'

type Octokit = InstanceType<typeof GitHub>

export const addLabels = async (octokit: Octokit, labels: string[]): Promise<void> => {
  if (github.context.payload.pull_request === undefined) {
    core.info(`ignore non pull-request event: ${github.context.eventName}`)
    return
  }
  if (labels.length < 1) {
    return
  }

  core.info(`adding labels ${labels.join(', ')} to pull request`)
  const { data: added } = await octokit.rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number,
    labels,
  })
  core.info(`added labels ${added.map((l) => l.name).join(', ')}`)
}

export const removeLabels = async (octokit: Octokit, labels: string[]): Promise<void> => {
  if (github.context.payload.pull_request === undefined) {
    core.info(`ignore non pull-request event: ${github.context.eventName}`)
    return
  }
  if (labels.length < 1) {
    return
  }

  for (const label of labels) {
    core.info(`removing label "${label}" from pull request`)
    try {
      await octokit.rest.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
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
