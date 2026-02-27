import * as core from '@actions/core'
import * as exec from '@actions/exec'

export const showColorDiff = async (base: string, head: string) =>
  await exec.exec('git', ['diff', '--no-index', '--color', base, head], {
    ignoreReturnCode: true,
  })

export type Diff = {
  baseRelativePath: string | undefined
  headRelativePath: string | undefined
  patch: string | undefined
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
  const chunks = splitDiffOutputToChunks(stdout)
  return chunks.map((chunk) => parseChunk(chunk, base, head))
}

type Chunk = string[]

const splitDiffOutputToChunks = (stdout: string): Chunk[] => {
  const lines = stdout.split(/\r?\n/)
  let currentChunk: Chunk = []
  const chunks: Chunk[] = [currentChunk]
  for (const line of lines) {
    if (line.startsWith('diff ')) {
      currentChunk = [line]
      chunks.push(currentChunk)
      continue
    }
    currentChunk.push(line)
  }
  return chunks.filter((chunk) => chunk.length > 0)
}

const parseChunk = (chunk: Chunk, base: string, head: string): Diff => {
  // The first line should be the diff header.
  // https://git-scm.com/docs/git-diff#generate_patch_text_with_p
  // For example:
  // diff --git a/tests/fixtures/head/bar.txt b/tests/fixtures/head/bar.txt
  const diffHeaderTokens = chunk[0].split(/ +/)
  const headPath = diffHeaderTokens.pop()
  const basePath = diffHeaderTokens.pop()
  return {
    baseRelativePath: canonicalPathInDiffHeader(basePath, base),
    headRelativePath: canonicalPathInDiffHeader(headPath, head),
    patch: findPatchFromChunk(chunk),
  }
}

const canonicalPathInDiffHeader = (s: string | undefined, prefix: string): string | undefined => {
  if (s === undefined) {
    return undefined
  }
  // The path consists of a, prefix and canonicalPath.
  // For example:
  // a/path/to/diff-action/tests/fixtures/base/deployment.yaml
  const prefixSegments = s.split(prefix)
  if (prefixSegments.length < 2) {
    return undefined
  }
  const canonicalPath = prefixSegments.pop()
  if (canonicalPath === undefined) {
    return undefined
  }
  if (canonicalPath.startsWith('/')) {
    return canonicalPath.substring(1)
  }
  return canonicalPath
}

const findPatchFromChunk = (chunk: Chunk): string | undefined => {
  const startIndex = chunk.findIndex((line) => line.startsWith('@@'))
  if (startIndex < 0) {
    return undefined
  }
  return chunk.slice(startIndex).join('\n')
}
