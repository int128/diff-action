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

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.token)
  const stat = await diff.diffStat(inputs.base, inputs.head)
  if (stat === undefined) {
    core.info('no diff')
    return
  }
  const diffs = await diff.diff(inputs.base, inputs.head)
  await comment(octokit, stat, diffs, inputs.commentHeader)
}
