import * as core from '@actions/core'
import { Diff } from './diff'
import { GitHubContext } from './github'

type CommentOptions = {
  header: string
  footer: string
  workflowRunURL: string
}

export const formatComment = (diffs: Diff[], o: CommentOptions): string => {
  const summary = formatSummary(diffs)
  let details = formatDetails(diffs)

  // omit too long details
  // https://github.community/t/maximum-length-for-the-comment-body-in-issues-and-pr/148867
  if (details.length > 60000) {
    core.info(`omit too long details (${details.length} chars)`)
    details = `See the full diff from ${o.workflowRunURL}`
  }

  return `\
${o.header}

${summary}

${details}

${o.footer}`
}

const formatSummary = (diffs: Diff[]): string =>
  diffs
    .map((d) => {
      if (d.headRelativePath !== undefined && d.baseRelativePath !== undefined) {
        return `- ${d.headRelativePath}`
      }
      if (d.headRelativePath !== undefined) {
        return `- ${d.headRelativePath} **(New)**`
      }
      if (d.baseRelativePath !== undefined) {
        return `- ${d.baseRelativePath} **(Deleted)**`
      }
    })
    .filter((line) => line)
    .join('\n')

const formatDetails = (diffs: Diff[]): string => {
  const lines = diffs.flatMap((d) => {
    const lines = []
    if (d.headRelativePath) {
      lines.push(`### ${d.headRelativePath}`)
    } else if (d.baseRelativePath) {
      lines.push(`### ${d.baseRelativePath}`)
    }
    lines.push('```diff')
    lines.push(d.content)
    lines.push('```')
    return lines
  })
  return `\
<details>

${lines.join('\n')}

</details>`
}

export const addComment = async (github: GitHubContext, body: string): Promise<void> => {
  if (github.eventName !== 'pull_request') {
    core.info(`ignore non pull-request event: ${github.eventName}`)
    return
  }
  const { data } = await github.octokit.rest.issues.createComment({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    body,
  })
  core.info(`created a comment as ${data.html_url}`)
}
