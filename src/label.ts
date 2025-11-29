import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { Context } from './github.js'

export const addLabels = async (labels: string[], octokit: Octokit, context: Context): Promise<void> => {
  if (labels.length < 1) {
    return
  }
  const issueNumber = inferIssueNumber(context)
  if (!issueNumber) {
    core.info(`Ignored non pull request event: ${context.eventName}`)
    return
  }

  core.info(`Adding the labels to #${issueNumber}: ${labels.join(', ')}`)
  const { data: added } = await octokit.rest.issues.addLabels({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    labels,
  })
  core.info(`Added the labels: ${added.map((l) => l.name).join(', ')}`)
}

export const removeLabels = async (labels: string[], octokit: Octokit, context: Context): Promise<void> => {
  if (labels.length < 1) {
    return
  }
  const issueNumber = inferIssueNumber(context)
  if (!issueNumber) {
    core.info(`Ignored non pull request event: ${context.eventName}`)
    return
  }

  for (const label of labels) {
    core.info(`Removing the label from #${issueNumber}: ${label}`)
    try {
      await octokit.rest.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        name: label,
      })
      core.info(`Removed the label: ${label}`)
    } catch (error) {
      if (isRequestError(error) && error.status === 404) {
        core.info(`Skip removing the label: ${String(error)}`)
        continue
      }
      throw error
    }
  }
}

const inferIssueNumber = (context: Context): number | undefined => {
  if ('pull_request' in context.payload) {
    return context.payload.pull_request.number
  }
  if ('issue' in context.payload) {
    return context.payload.issue.number
  }
}

type RequestError = Error & { status: number }

const isRequestError = (error: unknown): error is RequestError =>
  error instanceof Error && 'status' in error && typeof error.status === 'number'
