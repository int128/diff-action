import * as core from '@actions/core'
import * as diff from './diff'
import { addLabels, removeLabels } from './label'
import { comment } from './comment'
import { GitHubContext } from './github'

type Inputs = {
  base: string
  head: string
  label: string[]
  commentHeader: string
  commentFooter: string
}

type Outputs = {
  different: boolean
}

export const run = async (github: GitHubContext, inputs: Inputs): Promise<Outputs> => {
  core.startGroup('diff')
  const diffs = await diff.diff(inputs.base, inputs.head)
  core.endGroup()

  if (diffs.length === 0) {
    core.info('no diff')
    await removeLabels(github, inputs.label)
    return { different: false }
  }

  await comment(github, diffs, { header: inputs.commentHeader, footer: inputs.commentFooter })
  await addLabels(github, inputs.label)
  return { different: true }
}
