import * as core from '@actions/core'
import * as exec from '@actions/exec'

export const showColorDiff = async (base: string, head: string) =>
  await exec.exec('git', ['diff', '--no-index', '--color', base, head], {
    ignoreReturnCode: true,
  })

export type Diff = {
  baseRelativePath?: string
  headRelativePath?: string
  content: string
}

export const computeDiff = async (base: string, head: string): Promise<Diff[]> => {
  const { exitCode, stdout } = await exec.getExecOutput('git', ['diff', '--no-index', '--no-color', base, head], {
    ignoreReturnCode: true,
    silent: true,
  })
  core.info(`git-diff returned exit code ${exitCode}`)
  if (exitCode === 0) {
    return []
  }
  if (exitCode === 1) {
    return parseDiffOutput(stdout, base, head)
  }
  throw new Error(`git-diff failed with exit code ${exitCode}`)
}

const parseDiffOutput = (stdout: string, base: string, head: string): Diff[] => {
  const chunks = splitDiffLinesToChunks(stdout.split(/\n/))
  return chunks.map((chunk) => parseChunk(chunk, base, head))
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

const parseChunk = (chunk: Chunk, base: string, head: string): Diff => {
  // first line should be an indicator, e.g.,
  // diff --git a/tests/fixtures/head/bar.txt b/tests/fixtures/head/bar.txt
  const diffIndicator = chunk[0].split(/ +/)
  const h = diffIndicator.pop()
  const b = diffIndicator.pop()

  const diffBody = trimHeaderOfChunk(chunk)
  return {
    baseRelativePath: parseDiffPath(b, base),
    headRelativePath: parseDiffPath(h, head),
    content: diffBody.join('\n'),
  }
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

const trimHeaderOfChunk = (chunk: Chunk): Chunk => {
  const index = chunk.findIndex((line) => line.startsWith('-') || line.startsWith('+'))
  if (index < 0) {
    return chunk
  }
  return chunk.slice(index)
}
