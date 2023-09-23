import * as core from '@actions/core'
import * as diff from './diff'
import * as github from './github'
import { addLabels, removeLabels } from './label'
import { comment } from './comment'

type Inputs = {
  base: string
  head: string
  label: string[]
  commentHeader: string
  commentFooter: string
  token: string
}

type Outputs = {
  different: boolean
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  const octokit = github.getOctokit(inputs.token)

  core.startGroup('diff')
  const diffs = await diff.diff(inputs.base, inputs.head)
  core.endGroup()

  if (diffs.length === 0) {
    core.info('no diff')
    await removeLabels(octokit, inputs.label)
    return { different: false }
  }

  await comment(octokit, diffs, { header: inputs.commentHeader, footer: inputs.commentFooter })
  await addLabels(octokit, inputs.label)
  return { different: true }
}
