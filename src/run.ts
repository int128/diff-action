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
  commentHeader: string
  commentFooter: string
  updateIfExists: UpdateIfExistsType
  updateIfExistsKey: string
  skipNoDiff: boolean
}

type Outputs = {
  different: boolean
}

export const run = async (github: GitHubContext, inputs: Inputs): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs.base, inputs.head)
  core.endGroup()

  const diffs = await computeDiff(inputs.base, inputs.head)

  if (diffs.length === 0 && inputs.skipNoDiff) {
    core.info('No diff')
    await removeLabels(github, inputs.label)
    return { different: false }
  }

  const body = formatComment(diffs, {
    header: inputs.commentHeader,
    footer: inputs.commentFooter,
    workflowRunURL: github.workflowRunURL,
  })
  await addComment(github, {
    body,
    updateIfExists: inputs.updateIfExists,
    updateIfExistsKey: inputs.updateIfExistsKey,
  })

  if (diffs.length > 0) {
    await addLabels(github, inputs.label)
  } else {
    await removeLabels(github, inputs.label)
  }

  return { different: diffs.length > 0 }
}
