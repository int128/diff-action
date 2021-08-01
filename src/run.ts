import * as core from '@actions/core'
import * as github from '@actions/github'
import { comment } from './comment'
import * as diff from './diff'

type Inputs = {
  base: string
  head: string
  commentHeader: string
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
    return { different: false }
  }

  core.startGroup('diff')
  const diffs = await diff.diff(inputs.base, inputs.head)
  core.endGroup()

  await comment(octokit, stat, diffs, inputs.commentHeader)
  return { different: true }
}
