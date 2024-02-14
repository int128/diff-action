import * as core from '@actions/core'
import { GitHubContext } from './github'
import { computeDiff, showColorDiff } from './diff'
import { addLabels, removeLabels } from './label'
import { UpdateIfExistsType, addComment } from './comment'
import { formatComment } from './format'

type Inputs = {
  base: string
  head: string
  label: string[]
  commentHeader: string
  commentFooter: string
  updateIfExists: UpdateIfExistsType
  updateIfExistsKey: string
}

type Outputs = {
  different: boolean
}

export const run = async (github: GitHubContext, inputs: Inputs): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs.base, inputs.head)
  core.endGroup()

  const diffs = await computeDiff(inputs.base, inputs.head)

  if (diffs.length === 0) {
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
  await addLabels(github, inputs.label)
  return { different: true }
}
