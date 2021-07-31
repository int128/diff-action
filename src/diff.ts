import * as core from '@actions/core'
import * as exec from '@actions/exec'

export type Diff = {
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
  return parseDiffLines(lines)
}

export const parseDiffLines = (lines: string[]): Diff[] => {
  const diffs: Diff[] = []
  let current: string[] = []
  for (const line of lines) {
    if (line.startsWith('diff ')) {
      if (current.length > 0) {
        diffs.push({ content: current.join('\n') })
      }
      current = []
    }
    current.push(line)
  }
  if (current.length > 0) {
    diffs.push({ content: current.join('\n') })
  }
  return diffs
}

export const diffStat = async (base: string, head: string): Promise<string | void> => {
  const lines: string[] = []
  const code = await exec.exec('git', ['diff', '--no-index', '--stat', '--no-color', base, head], {
    ignoreReturnCode: true,
    listeners: {
      stdline: (line) => lines.push(line),
    },
  })
  core.info(`git-diff returned exit code ${code}`)
  if (code === 0) {
    return
  }
  if (code > 1) {
    throw new Error(`git-diff failed with exit code ${code}`)
  }
  return lines.join('\n')
}
