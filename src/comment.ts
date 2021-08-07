import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { Diff } from './diff'

type Octokit = InstanceType<typeof GitHub>

type CommentOptions = {
  header: string
  footer: string
}

export const comment = async (octokit: Octokit, stat: string, diffs: Diff[], o: CommentOptions): Promise<void> => {
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

  const body = `\
${o.header}

\`\`\`
${stat}
\`\`\`

${details}

${o.footer}`

  const { data } = await octokit.rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.payload.pull_request.number,
    body,
  })
  core.info(`created a comment as ${data.html_url}`)
}

const template = (e: Diff): string => {
  return `
\`\`\`diff
${e.content}
\`\`\`
`
}
