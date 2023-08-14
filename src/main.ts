import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  const outputs = await run({
    base: core.getInput('base', { required: true }),
    head: core.getInput('head', { required: true }),
    label: core.getMultilineInput('label', { required: false }),
    commentHeader: core.getInput('comment-header'),
    commentFooter: core.getInput('comment-footer'),
    token: core.getInput('token', { required: true }),
  })
  core.setOutput('different', outputs.different)
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
