import * as core from '@actions/core'
import { GitHubContext } from './github.js'
import { computeDiff, showColorDiff } from './diff.js'
import { addLabels, removeLabels } from './label.js'
import { UpdateIfExistsType, addComment } from './comment.js'
import { formatComment } from './format.js'

type Inputs = {
  base: string
  head: string
  label: string[]
  comment: boolean
  commentBodyNoDiff: string
  commentHeader: string
  commentFooter: string
  updateIfExists: UpdateIfExistsType
  updateIfExistsKey: string
}

type Outputs = {
  different: boolean
  commentBody: string
}

export const run = async (github: GitHubContext, inputs: Inputs): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs.base, inputs.head)
  core.endGroup()

  const diffs = await computeDiff(inputs.base, inputs.head)
  const commentBody = formatComment(diffs, {
    bodyNoDiff: inputs.commentBodyNoDiff,
    workflowRunURL: github.workflowRunURL,
  })

  if (inputs.comment && commentBody.length > 0) {
    await addComment(github, {
      body: `${inputs.commentHeader}\n\n${commentBody}\n\n${inputs.commentFooter}`,
      updateIfExists: inputs.updateIfExists,
      updateIfExistsKey: inputs.updateIfExistsKey,
    })
  }

  if (diffs.length > 0) {
    await addLabels(github, inputs.label)
  } else {
    await removeLabels(github, inputs.label)
  }

  return {
    different: diffs.length > 0,
    commentBody,
  }
}
