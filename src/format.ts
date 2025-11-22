import * as core from '@actions/core'
import type { Diff } from './diff.js'

type CommentOptions = {
  workflowRunURL: string
}

export const formatComment = (diffs: Diff[], o: CommentOptions): string => {
  if (diffs.length === 0) {
    return ''
  }

  // Comment body must be less than 64kB
  // https://github.community/t/maximum-length-for-the-comment-body-in-issues-and-pr/148867
  const fullComment = generateFullComment(diffs, o)
  if (fullComment.length < 60000) {
    return fullComment
  }
  core.info(`Fallback to short comment, because full comment is too long (${fullComment.length} chars)`)
  const shortComment = generateShortComment(diffs, o)
  if (shortComment.length < 60000) {
    return shortComment
  }
  core.info(`Fallback to summary comment, because short comment is too long (${shortComment.length} chars)`)
  const summaryComment = generateSummaryComment(diffs, o)
  if (summaryComment.length < 60000) {
    return summaryComment
  }
  core.info(`Fallback to last resort, because summary comment is too long (${summaryComment.length} chars)`)
  return `See the full diff from ${o.workflowRunURL}`
}

const generateFullComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}

<details>
<summary>Diff</summary>

${formatDetails(diffs, o)}

</details>

[GitHub Actions](${o.workflowRunURL})`

const generateShortComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}

<details>
<summary>Diff</summary>

${formatShortDetails(diffs, o)}

</details>

See the [full diff](${o.workflowRunURL})`

const generateSummaryComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}

See the [full diff](${o.workflowRunURL})`

const formatSummary = (diffs: Diff[]): string =>
  diffs
    .map((d) => {
      if (d.headRelativePath === '' && d.baseRelativePath === '') {
        // When a file path is given to this action, omit the summary list.
        return ''
      }
      if (d.headRelativePath !== undefined && d.baseRelativePath !== undefined) {
        return `- ${d.headRelativePath}`
      }
      if (d.headRelativePath !== undefined) {
        return `- ${d.headRelativePath} **(New)**`
      }
      if (d.baseRelativePath !== undefined) {
        return `- ${d.baseRelativePath} **(Deleted)**`
      }
      return ''
    })
    .filter((line) => line)
    .join('\n')

const formatDetails = (diffs: Diff[], o: CommentOptions): string => {
  const lines = diffs.flatMap((d) => {
    const lines = []
    if (d.headRelativePath) {
      lines.push(`### ${d.headRelativePath}`)
    } else if (d.baseRelativePath) {
      lines.push(`### ${d.baseRelativePath}`)
    }
    lines.push(...formatDiff(d, 10000, o))
    return lines
  })
  return lines.join('\n')
}

const formatShortDetails = (diffs: Diff[], o: CommentOptions): string => {
  const lines = diffs.flatMap((d) => {
    if (d.headRelativePath === undefined && d.baseRelativePath !== undefined) {
      return [`### ${d.headRelativePath} (deleted)`]
    }
    const lines = []
    lines.push(`### ${d.baseRelativePath}`)
    lines.push(...formatDiff(d, 4000, o))
    return lines
  })
  return lines.join('\n')
}

const formatDiff = (diff: Diff, trimSize: number, o: CommentOptions): string[] => {
  if (diff.content.length < trimSize) {
    return ['```diff', diff.content, '```']
  }
  return ['```diff', diff.content.substring(0, trimSize), '```', `See the full diff from ${o.workflowRunURL}`]
}
