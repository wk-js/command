import { parse_file } from "./yaml"
import { create_task2, exists, format_commands, help2 } from "./task"
import { run } from "./exec"
import { Context } from "./context"
import * as WK from './wk'
import { flat } from "lol/js/object"
import { spawnSync } from "child_process"
import { DScalar } from "./types"

let VERBOSE = false

async function main() {
  // Parse ARGV
  const { wk, variables } = WK.parse('wk ' + process.argv.slice(2).join(' '))
  Context.configs(wk)

  // Parse file
  Context.envs(process.env as DScalar)

  const [vars, commands, config, env] = parse_file(wk.commands)
  Context.vars(vars)
  Context.vars(variables)
  Context.envs(env)
  Context.configs(config)

  const cmds = format_commands(flat(commands))

  if (!exists(wk.command, cmds)) {
    help2(cmds)
  } else {
    const task = create_task2(wk.command, cmds)
    if (!Context.config("debug")) {
      console.log(`\n> ${task}\n`)
      spawnSync(task, { shell: true, stdio: 'inherit', env: Context.envs() as Record<string, string | undefined> })
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