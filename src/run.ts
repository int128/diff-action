import * as core from '@actions/core'
import * as github from '@actions/github'
import { comment } from './comment'
import * as diff from './diff'
import { addLabels, removeLabels } from './label'

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

  core.startGroup('diff --stat')
  const stat = await diff.diffStat(inputs.base, inputs.head)
  core.endGroup()
  if (stat === undefined) {
    core.info('no diff')
    await removeLabels(octokit, inputs.label)
    return { different: false }
  }

  await addLabels(octokit, inputs.label)

  core.startGroup('diff')
  const diffs = await diff.diff(inputs.base, inputs.head)
  core.endGroup()

  await comment(octokit, stat, diffs, { header: inputs.commentHeader, footer: inputs.commentFooter })
  return { different: true }
}
