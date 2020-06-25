import { parse_file } from "./yaml"
import { create_task2, exists, format_commands, help2 } from "./task"
import { run } from "./exec"
import { Context } from "./context"
import * as WK from './wk'
import { flat } from "lol/js/object"
import { spawnSync } from "child_process"

let VERBOSE = false

async function main() {
  // Parse ARGV
  const { wk, variables } = WK.parse('wk ' + process.argv.slice(2).join(' '))
  Object.assign(Context.configs, wk)

  // Resolve
  const argv = wk.argv?.split(' ')
  const command = argv?.shift()
  Context.var("command", command)

  // Parse file
  Context.envs(process.env)
  const [vars, commands, config, env] = parse_file(wk.commands)
  Context.vars(vars)
  Context.envs(env)
  Context.configs(config)

  const cmds = format_commands(flat(commands))

  if (!exists(command!, cmds)) {
    help2(cmds)
  } else {
    const task = create_task2(command!, cmds)
    if (!Context.config("debug")) {
      console.log(`\n> ${task}\n`)
      spawnSync(task, { shell: true, stdio: 'inherit', env: Context.envs() })
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