import * as core from '@actions/core'
import { run } from './run'
import { getGitHubContext } from './github'

const main = async (): Promise<void> => {
  const outputs = await run(getGitHubContext(core.getInput('token', { required: true })), {
    base: core.getInput('base', { required: true }),
    head: core.getInput('head', { required: true }),
    diffExtraArgs: core.getMultilineInput('diff-extra-args'),
    label: core.getMultilineInput('label', { required: false }),
    commentHeader: core.getInput('comment-header'),
    commentFooter: core.getInput('comment-footer'),
  })
  core.setOutput('different', outputs.different)
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
