import { spawn } from 'node:child_process'
import path from 'node:path'

export type Opener = (filePath: string) => void | Promise<void>

/**
 * Open a file in the default system browser.
 * macOS: open, Linux: xdg-open, Windows: start
 */
function openInBrowser (filePath: string): void {
  const absolutePath = path.resolve(filePath)
  const platform = process.platform
  let command: string
  let args: string[]
  if (platform === 'darwin') {
    command = 'open'
    args = [absolutePath]
  } else if (platform === 'win32') {
    command = 'start'
    args = ['', absolutePath]
  } else {
    command = 'xdg-open'
    args = [absolutePath]
  }
  spawn(command, args, { stdio: 'ignore', shell: platform === 'win32' })
}

/**
 * Returns the default opener (opens file in browser).
 * Inject a custom opener in tests to no-op or spy.
 */
export function getDefaultOpener (): Opener {
  return openInBrowser
}
