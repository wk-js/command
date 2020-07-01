import { parse_file } from "./yaml"
import * as Task from "./task"
import { Context } from "./context"
import * as WK from './wk'
import { flat } from "lol/js/object"
import { spawnSync } from "child_process"
import { DScalar } from "./types"

let VERBOSE = false

async function main() {
  // Parse ARGV
  const argv = WK.parse(process.argv.slice(2))

  // Apply configuration
  Context.configs(argv.wk)

  // Merge environment variables
  Context.envs({
    ...process.env as DScalar,
    ...argv.env,
  })

  // Parse file
  const file = parse_file(argv.wk.commands)

  // Apply file variables, environment and config
  Context.vars(file.variables)
  Context.envs(file.env)
  Context.configs(file.config)

  // Merge variables from argv
  Context.vars(argv.variables)

  // Format commands
  const commands = Task.format_commands(file.commands)

  if (!Task.exists(argv.wk.command, commands)) {
    Task.help(commands)
  } else {
    const task = Task.parse(argv.wk.command, commands)
    console.log(`\n> ${task}\n`)
    if (!Context.config("debug")) {
      spawnSync(task, {
        shell: true,
        stdio: 'inherit',
        env: Context.envs() as Record<string, string | undefined>
      })
    }
  }
}

main()
  .catch(e => {
    if (e instanceof Error) {
      console.log(VERBOSE ? e : e.message)
    } else {
      console.log(e)
    }
  })