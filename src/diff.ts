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
  type Chunk = string[]
  let chunk: Chunk = []
  const chunks: Chunk[] = []
  for (const line of lines) {
    if (line.startsWith('diff ')) {
      chunks.push(chunk)
      chunk = []
    }
    chunk.push(line)
  }
  chunks.push(chunk)
  return chunks
    .filter((c) => c.length > 0)
    .map((c) => {
      const e = c[0].split(/ +/)
      const h = parseDiffPath(e.pop(), head)
      const b = parseDiffPath(e.pop(), base)
      return {
        baseRelativePath: b,
        headRelativePath: h,
        content: c.join('\n'),
      }
    })
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
