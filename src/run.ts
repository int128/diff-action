import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import { computeDiff, showColorDiff } from './diff.js'
import { formatComment } from './format.js'
import type { Context } from './github.js'
import { addLabels, removeLabels } from './label.js'

type Inputs = {
  base: string
  head: string
  label: string[]
}

type Outputs = {
  commentBody: string
}

export const run = async (inputs: Inputs, octokit: Octokit, context: Context): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs.base, inputs.head)
  core.endGroup()

  const diffs = await computeDiff(inputs.base, inputs.head)
  const commentBody = formatComment(diffs, {
    workflowRunURL: `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
  })

  if (diffs.length > 0) {
    await addLabels(inputs.label, octokit, context)
  } else {
    await removeLabels(inputs.label, octokit, context)
  }

  return {
    commentBody,
  }
}
