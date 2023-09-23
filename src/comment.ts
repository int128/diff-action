import * as core from '@actions/core'
import { Diff } from './diff'
import { GitHubContext } from './github'

type CommentOptions = {
  header: string
  footer: string
}

export const comment = async (github: GitHubContext, diffs: Diff[], o: CommentOptions): Promise<void> => {
  if (github.eventName === 'pull_request') {
    core.info(`ignore non pull-request event: ${github.eventName}`)
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
    details = `See the full diff from ${github.workflowRunURL}`
  }

  const body = `\
${o.header}

${diffs
  .map(summary)
  .filter((e) => e)
  .join('\n')}

${details}

${o.footer}`

  const { data } = await github.octokit.rest.issues.createComment({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    body,
  })
  core.info(`created a comment as ${data.html_url}`)
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
