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

  const body = `\
${o.header}

${diffs
  .map(summary)
  .filter((e) => e)
  .join('\n')}

${details}

${o.footer}`

  await createOrUpdate(octokit, github.context.payload.pull_request.number, body)
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

const createOrUpdate = async (octokit: Octokit, issue_number: number, body: string) => {
  const key = `<!-- action=${github.context.action}, job=${github.context.job} -->`
  core.info(`finding a comment by ${key}`)
  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number,
  })

  for (const c of comments) {
    if (c.body?.includes(key)) {
      const { data } = await octokit.rest.issues.updateComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number,
        comment_id: c.id,
        body: `${body}\n${key}`,
      })
      core.info(`updated the comment as ${data.html_url}`)
      return
    }
  }

  const { data } = await octokit.rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number,
    body: `${body}\n${key}`,
  })
  core.info(`created a comment as ${data.html_url}`)
}
