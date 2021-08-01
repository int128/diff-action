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
  const stat = await diff.diffStat(inputs.base, inputs.head)
  if (stat === undefined) {
    core.info('no diff')
    return { different: false }
  }
  const diffs = await diff.diff(inputs.base, inputs.head)
  await comment(octokit, stat, diffs, inputs.commentHeader)
  return { different: true }
}
