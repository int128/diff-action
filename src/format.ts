import type { Diff } from './diff.js'

type CommentOptions = {
  workflowRunURL: string
}

export type CommentSet = {
  fullComment: string
  shortComment: string
  listComment: string
  summaryComment: string
}

export const formatComment = (diffs: Diff[], o: CommentOptions): CommentSet => {
  if (diffs.length === 0) {
    return {
      fullComment: '',
      shortComment: '',
      listComment: '',
      summaryComment: '',
    }
  }
  return {
    fullComment: generateFullComment(diffs, o),
    shortComment: generateShortComment(diffs, o),
    listComment: generateListComment(diffs, o),
    summaryComment: generateSummaryComment(diffs, o),
  }
}

const generateFullComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}:

${formatList(diffs)}

<details>
<summary>Diff</summary>

${formatDetails(diffs, o)}

</details>

[GitHub Actions](${o.workflowRunURL})`

const generateShortComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}:

${formatList(diffs)}

<details>
<summary>Diff</summary>

${formatShortDetails(diffs, o)}

</details>

See the [full diff](${o.workflowRunURL})`

const generateListComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}:

${formatList(diffs)}

See the [full diff](${o.workflowRunURL})`

const generateSummaryComment = (diffs: Diff[], o: CommentOptions): string => `\
${formatSummary(diffs)}. See the [full diff](${o.workflowRunURL})`

const formatSummary = (diffs: Diff[]): string => {
  return `${diffs.length} file${diffs.length > 1 ? 's' : ''} changed`
}

const formatList = (diffs: Diff[]): string =>
  diffs
    .map((d) => {
      if (d.headRelativePath === '' && d.baseRelativePath === '') {
        // When a file path is given to this action, omit the summary list.
        return ''
      }
      if (d.headRelativePath !== undefined && d.baseRelativePath !== undefined) {
        return `- **M** ${d.headRelativePath}`
      }
      if (d.headRelativePath !== undefined) {
        return `- **A** ${d.headRelativePath}`
      }
      if (d.baseRelativePath !== undefined) {
        return `- **D** ${d.baseRelativePath}`
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
  if (diff.patch.length < trimSize) {
    return ['```diff', diff.patch, '```']
  }
  return ['```diff', diff.patch.substring(0, trimSize), '```', `See the full diff from ${o.workflowRunURL}`]
}
