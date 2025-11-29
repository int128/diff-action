import * as core from '@actions/core'
import { getGitHubContext } from './github.js'
import { run } from './run.js'

const main = async (): Promise<void> => {
  const outputs = await run(getGitHubContext(core.getInput('token', { required: true })), {
    base: core.getInput('base', { required: true }),
    head: core.getInput('head', { required: true }),
    label: core.getMultilineInput('label', { required: false }),
  })
  core.info(`Setting the outputs to ${JSON.stringify(outputs)}`)
  core.setOutput('comment-body', outputs.commentBody)
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
