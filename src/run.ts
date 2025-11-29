import * as core from '@actions/core'
import { computeDiff, showColorDiff } from './diff.js'
import { formatComment } from './format.js'
import type { GitHubContext } from './github.js'
import { addLabels, removeLabels } from './label.js'

type Inputs = {
  base: string
  head: string
  label: string[]
}

type Outputs = {
  commentBody: string
}

export const run = async (github: GitHubContext, inputs: Inputs): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs.base, inputs.head)
  core.endGroup()

  const diffs = await computeDiff(inputs.base, inputs.head)
  const commentBody = formatComment(diffs, {
    workflowRunURL: github.workflowRunURL,
  })

  if (diffs.length > 0) {
    await addLabels(github, inputs.label)
  } else {
    await removeLabels(github, inputs.label)
  }

  return {
    commentBody,
  }
}
