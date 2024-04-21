import * as core from '@actions/core'
import { run } from './run.js'
import { getGitHubContext } from './github.js'
import { UpdateIfExistsType } from './comment.js'

const main = async (): Promise<void> => {
  const outputs = await run(getGitHubContext(core.getInput('token', { required: true })), {
    base: core.getInput('base', { required: true }),
    head: core.getInput('head', { required: true }),
    label: core.getMultilineInput('label', { required: false }),
    commentHeader: core.getInput('comment-header'),
    commentFooter: core.getInput('comment-footer'),
    updateIfExists: updateIfExistsValue(core.getInput('update-if-exists')),
    updateIfExistsKey: core.getInput('update-if-exists-key'),
  })
  core.setOutput('different', outputs.different)
}

const updateIfExistsValue = (s: string): UpdateIfExistsType => {
  if (!s) {
    return undefined
  }
  if (s !== 'replace' && s !== 'append' && s !== 'recreate') {
    throw new Error(`update-if-exists must be replace or recreate: ${s}`)
  }
  return s
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
