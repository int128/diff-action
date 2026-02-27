import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import { computeDiff, showColorDiff } from './diff.js'
import { type CommentSet, formatComment } from './format.js'
import type { Context } from './github.js'
import { addLabels, removeLabels } from './label.js'

type Inputs = {
  base: string
  head: string
  label: string[]
}

type Outputs = {
  commentBody: string
}

export const run = async (inputs: Inputs, octokit: Octokit, context: Context): Promise<Outputs> => {
  core.startGroup('diff')
  await showColorDiff(inputs.base, inputs.head)
  core.endGroup()

  const diffs = await computeDiff(inputs.base, inputs.head)
  if (diffs.length > 0) {
    await addLabels(inputs.label, octokit, context)
  } else {
    await removeLabels(inputs.label, octokit, context)
  }

  const commentSet = formatComment(diffs, {
    workflowRunURL: `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
  })
  core.info(`The full comment is ${commentSet.fullComment.length} chars`)
  core.info(`The short comment is ${commentSet.shortComment.length} chars`)
  core.info(`The list comment is ${commentSet.listComment.length} chars`)

  core.summary.addHeading('Diff', 2)
  core.summary.addRaw(getJobSummary(commentSet))
  await core.summary.write()

  return {
    commentBody: getCommentBody(commentSet),
  }
}

const getCommentBody = (commentSet: CommentSet): string => {
  // The comment body must be less than 64kB.
  // https://github.community/t/maximum-length-for-the-comment-body-in-issues-and-pr/148867
  const maxLength = 60000
  if (commentSet.fullComment.length < maxLength) {
    return commentSet.fullComment
  }
  if (commentSet.shortComment.length < maxLength) {
    return commentSet.shortComment
  }
  if (commentSet.listComment.length < maxLength) {
    return commentSet.listComment
  }
  return commentSet.summaryComment
}

const getJobSummary = (commentSet: CommentSet): string => {
  // The job summary must be less than 1MiB.
  // https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#step-isolation-and-limits
  const maxLength = 1000000
  if (commentSet.fullComment.length < maxLength) {
    return commentSet.fullComment
  }
  if (commentSet.shortComment.length < maxLength) {
    return commentSet.shortComment
  }
  if (commentSet.listComment.length < maxLength) {
    return commentSet.listComment
  }
  return commentSet.summaryComment
}
