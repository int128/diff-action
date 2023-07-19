import * as core from '@actions/core'
import * as github from '@actions/github'
import { Diff } from './diff'
import { GitHub } from '@actions/github/lib/utils'

type Octokit = InstanceType<typeof GitHub>

type CommentOptions = {
  header: string
  footer: string
}

export const comment = async (octokit: Octokit, diffs: Diff[], o: CommentOptions): Promise<void> => {
  if (github.context.payload.pull_request === undefined) {
    core.info(`ignore non pull-request event: ${github.context.eventName}`)
    return
  }

  let details = `
<details>

${diffs.map(template).join('\n')}

</details>
`
  // omit too long details
  // https://github.community/t/maximum-length-for-the-comment-body-in-issues-and-pr/148867
  if (details.length > 60000) {
    core.info(`omit too long details (${details.length} chars)`)
    const runURL = `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}`
    details = `See the full diff from ${runURL}`
  }

  const key = `\
<!-- ${github.context.workflow}/${github.context.job}/${github.context.action} -->
${o.footer}`

  const body = `\
${o.header}

${diffs
  .map(summary)
  .filter((e) => e)
  .join('\n')}

${details}

${key}`

  // Find the previous comment with the same key
  const previousComment = await octokit.rest.issues.getComments({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.payload.pull_request.number,
    q: `body:${key}`,
  })

  // If the previous comment exists, update it
  if (previousComment.length > 0) {
    const commentID = previousComment[0].id
    core.info(`updating comment ${commentID}`)
    await octokit.rest.issues.updateComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.payload.pull_request.number,
      comment_id: commentID,
      body,
    })
    // log info updated previous comment htmlURL
    core.info(`updated previous comment ${previousComment[0].html_url}`)
  } else {
    // Otherwise, create a new comment
    core.info(`creating new comment`)
    const { data } = await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.payload.pull_request.number,
      body,
    })
    // log info created new comment htmlURL
    core.info(`created new comment ${data.html_url}`)
  }
}

const summary = (e: Diff) => {
  if (e.headRelativePath !== undefined && e.baseRelativePath !== undefined) {
    return `- ${e.headRelativePath}`
  }
  if (e.headRelativePath !== undefined) {
    return `- ${e.headRelativePath} **(New)**`
  }
  if (e.baseRelativePath !== undefined) {
    return `- ${e.baseRelativePath} **(Deleted)**`
  }
}

const template = (e: Diff) => {
  const lines: string[] = []

  if (e.headRelativePath) {
    lines.push(`### ${e.headRelativePath}`)
  } else if (e.baseRelativePath) {
    lines.push(`### ${e.baseRelativePath}`)
  }

  lines.push('```diff')
  lines.push(e.content)
  lines.push('```')
  return lines.join('\n')
}
