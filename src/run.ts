import * as core from '@actions/core'
import { computeDiff, showColorDiff } from './diff'
import { addLabels, removeLabels } from './label'
import { addComment, formatComment } from './comment'
import { GitHubContext } from './github'

type Inputs = {
  base: string
  head: string
  diffExtraArgs: string[]
  label: string[]
  commentHeader: string
  commentFooter: string
}

type Outputs = {
  different: boolean
}

export const run = async (github: GitHubContext, inputs: Inputs): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs)
  core.endGroup()

  const diffs = await computeDiff(inputs)

  if (diffs.length === 0) {
    core.info('no diff')
    await removeLabels(github, inputs.label)
    return { different: false }
  }

  const comment = formatComment(diffs, {
    header: inputs.commentHeader,
    footer: inputs.commentFooter,
    workflowRunURL: github.workflowRunURL,
  })
  await addComment(github, comment)
  await addLabels(github, inputs.label)
  return { different: true }
}
