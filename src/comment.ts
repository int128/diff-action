import * as core from '@actions/core'
import { GitHubContext } from './github.js'

type Comment = {
  body: string
  updateIfExists: UpdateIfExistsType
  updateIfExistsKey: string
}

export type UpdateIfExistsType = 'create' | 'replace' | 'append' | 'recreate'

export const createCommentKey = (key: string): string => `<!-- diff-action/${key} -->`

export const addComment = async (github: GitHubContext, comment: Comment): Promise<void> => {
  if (!github.issueNumber) {
    core.info(`Ignored non pull request event: ${github.eventName}`)
    return
  }

  if (comment.updateIfExists === 'create') {
    if (comment.body === '') {
      core.info('Nothing to create')
      return
    }
    core.info(`Creating a comment to #${github.issueNumber}`)
    const { data: created } = await github.octokit.rest.issues.createComment({
      owner: github.owner,
      repo: github.repo,
      issue_number: github.issueNumber,
      body: comment.body,
    })
    core.info(`Created a comment ${created.html_url}`)
    return
  }

  const commentKey = createCommentKey(comment.updateIfExistsKey)
  core.info(`Finding key ${commentKey} from comments in #${github.issueNumber}`)
  const existingComment = await findComment(github, commentKey)
  if (!existingComment) {
    core.info(`Key not found in #${github.issueNumber}`)
    if (comment.body === '') {
      core.info('Nothing to create')
      return
    }
    const { data: created } = await github.octokit.rest.issues.createComment({
      owner: github.owner,
      repo: github.repo,
      issue_number: github.issueNumber,
      body: `${comment.body}\n${commentKey}`,
    })
    core.info(`Created a comment ${created.html_url}`)
    return
  }
  core.info(`Key found at the comment ${existingComment.html_url}`)

  if (comment.updateIfExists === 'recreate') {
    await github.octokit.rest.issues.deleteComment({
      owner: github.owner,
      repo: github.repo,
      comment_id: existingComment.id,
    })
    core.info(`Deleted the comment ${existingComment.html_url}`)
    if (comment.body === '') {
      core.info('Nothing to create')
      return
    }
    const { data: created } = await github.octokit.rest.issues.createComment({
      owner: github.owner,
      repo: github.repo,
      issue_number: github.issueNumber,
      body: `${comment.body}\n${commentKey}`,
    })
    core.info(`Created a comment ${created.html_url}`)
    return
  }

  let body = `${comment.body}\n${commentKey}`
  if (comment.updateIfExists === 'append') {
    body = `${existingComment.body}\n${body}`
  }
  const { data: updated } = await github.octokit.rest.issues.updateComment({
    owner: github.owner,
    repo: github.repo,
    comment_id: existingComment.id,
    body,
  })
  core.info(`Updated the comment ${updated.html_url}`)
}

type ExistingComment = {
  id: number
  body: string
  html_url: string
}

const findComment = async (github: GitHubContext, key: string): Promise<ExistingComment | undefined> => {
  const { data: comments } = await github.octokit.rest.issues.listComments({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    sort: 'created',
    direction: 'desc',
    per_page: 100,
  })
  core.info(`Found ${comments.length} comment(s) of #${github.issueNumber}`)
  for (const comment of comments) {
    if (comment.body?.includes(key)) {
      return { ...comment, body: comment.body }
    }
  }
}

export const deleteCommentIfExists = async (github: GitHubContext, updateIfExistsKey: string): Promise<void> => {
  const comment = await findComment(github, createCommentKey(updateIfExistsKey))

  if (comment) {
    await github.octokit.rest.issues.deleteComment({
      owner: github.owner,
      repo: github.repo,
      comment_id: comment.id,
    })
  }
}
