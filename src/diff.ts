import * as core from '@actions/core'
import * as exec from '@actions/exec'

export type Diff = {
  baseRelativePath?: string
  headRelativePath?: string
  content: string
}

export const diff = async (base: string, head: string): Promise<Diff[]> => {
  const lines: string[] = []
  const code = await exec.exec('git', ['diff', '--no-index', '--no-color', base, head], {
    ignoreReturnCode: true,
    listeners: {
      stdline: (line) => lines.push(line),
    },
  })
  core.info(`git-diff returned exit code ${code}`)
  if (code === 0) {
    return []
  }
  if (code > 1) {
    throw new Error(`git-diff failed with exit code ${code}`)
  }
  return parseDiffLines(lines, base, head)
}

export const parseDiffLines = (lines: string[], base: string, head: string): Diff[] => {
  const chunks = splitDiffLinesToChunks(lines)
  return chunks.map((chunk) => {
    const e = chunk[0].split(/ +/)
    const h = parseDiffPath(e.pop(), head)
    const b = parseDiffPath(e.pop(), base)
    return {
      baseRelativePath: b,
      headRelativePath: h,
      content: chunk.join('\n'),
    }
  })
}

type Chunk = string[]

const splitDiffLinesToChunks = (lines: string[]): Chunk[] => {
  let current: Chunk = []
  const chunks: Chunk[] = [current]
  for (const line of lines) {
    if (line.startsWith('diff ')) {
      current = [line]
      chunks.push(current)
      continue
    }

    current.push(line)
  }

  return chunks.filter((chunk) => chunk.length > 0)
}

// parse path in diff output, e.g.,
// a/path/to/diff-action/tests/fixtures/base/deployment.yaml
const parseDiffPath = (s: string | undefined, prefix: string): string | undefined => {
  if (s === undefined) {
    return undefined
  }
  const a = s.split(prefix)
  if (a.length < 2) {
    return undefined
  }
  const relative = a.pop()
  if (relative === undefined) {
    return undefined
  }
  if (relative.startsWith('/')) {
    return relative.substring(1)
  }
  return relative
}
