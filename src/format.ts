import { type Diff, Status } from './diff.js'

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

${formatFullDetails(diffs, o)}

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
  const breakdown = {
    added: 0,
    deleted: 0,
    renamed100: 0,
    renamed99: 0,
    modified: 0,
  }
  for (const diff of diffs) {
    if (diff.status === Status.Added) {
      breakdown.added++
    } else if (diff.status === Status.Deleted) {
      breakdown.deleted++
    } else if (diff.status === Status.Renamed) {
      if (diff.similarityIndex === 100) {
        breakdown.renamed100++
      } else {
        breakdown.renamed99++
      }
    } else if (diff.status === Status.Modified) {
      breakdown.modified++
    }
  }
  const parts = []
  if (breakdown.added > 0) {
    parts.push(`\`A\` ${breakdown.added}`)
  } else if (breakdown.deleted > 0) {
    parts.push(`\`D\` ${breakdown.deleted}`)
  } else if (breakdown.renamed100 > 0) {
    parts.push(`\`R(100%)\` ${breakdown.renamed100}`)
  } else if (breakdown.renamed99 > 0) {
    parts.push(`\`R(-99%)\` ${breakdown.renamed99}`)
  } else if (breakdown.modified > 0) {
    parts.push(`\`M\` ${breakdown.modified}`)
  }
  return `${diffs.length} file${diffs.length > 1 ? 's' : ''} changed (${parts.join(', ')})`
}

const formatList = (diffs: Diff[]): string =>
  diffs
    .map((diff) => {
      if (diff.status === Status.Added) {
        return `- \`A\` ${diff.headPath}`
      } else if (diff.status === Status.Deleted) {
        return `- \`D\` ${diff.basePath}`
      } else if (diff.status === Status.Renamed) {
        return `- \`R(${diff.similarityIndex}%)\` ${diff.headPath}`
      }
      return `- \`M\` ${diff.headPath}`
    })
    .join('\n')

const formatFullDetails = (diffs: Diff[], o: CommentOptions): string =>
  diffs
    .flatMap((diff): string[] => {
      const patch = formatPatch(diff, 10000, o)
      if (diff.status === Status.Added) {
        return [`### ${diff.headPath}`, ...patch]
      } else if (diff.status === Status.Deleted) {
        return [`### ${diff.basePath}`, ...patch]
      } else if (diff.status === Status.Renamed) {
        return [`### ${diff.headPath}`, ...patch]
      }
      return [`### ${diff.headPath}`, ...patch]
    })
    .join('\n')

const formatShortDetails = (diffs: Diff[], o: CommentOptions): string =>
  diffs
    .flatMap((diff): string[] => {
      if (diff.status === Status.Added) {
        return [`### \`A\` ${diff.headPath}`]
      } else if (diff.status === Status.Deleted) {
        return [`### \`D\` ${diff.basePath}`]
      }
      const patch = formatPatch(diff, 4000, o)
      if (diff.status === Status.Renamed) {
        return [`### ${diff.headPath}`, ...patch]
      }
      return [`### ${diff.headPath}`, ...patch]
    })
    .join('\n')

const formatPatch = (diff: Diff, trimSize: number, o: CommentOptions): string[] => {
  const renameHeader = []
  if (diff.status === Status.Renamed) {
    renameHeader.push(`--- ${diff.basePath}`, `+++ ${diff.headPath} (${diff.similarityIndex}%)`)
  }
  if (diff.patch === undefined) {
    if (renameHeader.length > 0) {
      return ['```diff', ...renameHeader, '```']
    }
    return []
  }
  if (diff.patch.length < trimSize) {
    return ['```diff', ...renameHeader, diff.patch, '```']
  }
  return [
    '```diff',
    ...renameHeader,
    diff.patch.substring(0, trimSize),
    '```',
    `See the full diff from ${o.workflowRunURL}`,
  ]
}
