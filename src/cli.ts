import { parse_file } from "./yaml"
import { WKOptions, Commands2 } from "./types"
import { help, create_task, create_task2, exists, format_commands, help2 } from "./task"
import { run } from "./exec"
import { Context } from "./context"
import { parse } from "./argv"
import * as WK from './wk'
import { join } from "path"
import { flat } from "lol/js/object"

let VERBOSE = false

// function getOptions(): [WKOptions, string[]] {
//   let _wk_argv: string[] = []
//   let _argv = process.argv.slice(2)
//   let [wk0, tmp] = parse(process.argv.slice(2))

//   const index = _argv.indexOf(tmp[0])
//   if (tmp[0] && index > -1) {
//     _wk_argv = _argv.splice(0, index)
//     let [wk1] = parse(_wk_argv)
//     return [wk1, _argv]
//   }

//   return [wk0, []]
// }

// function setOptions(options: WKOptions) {
//   Context.global("wk::verbose", options.verbose)
//   Context.global("wk::debug", options.debug)
//   Context.global("wk::nocolor", options.nocolor)
//   Context.global("wk::commandpath", join(process.cwd(), options.commands))
// }

async function main() {
  // Parse ARGV
  const { wk, variables } = WK.parse('wk ' + process.argv.slice(2).join(' '))
  Object.assign(Context.options, wk)

  // Resolve
  const argv = wk.argv?.split(' ')
  const command = argv?.shift()
  Context.global("WK::Command", command)

  // Parse file
  Object.keys(process.env).forEach(k => Context.global(k, process.env[k]))
  Context.push(Context.create())
  const [global, commands, config] = parse_file(wk.commands)
  Context.pop()
  Object.keys(global).forEach(k => Context.global(k, global[k]))
  Object.assign(Context.options, config)

  const cmds = format_commands(flat(commands))

  if (!exists(command!, cmds)) {
    help2(cmds)
  } else {
    const ctx = Context.create()
    ctx.args = argv || []
    Object.keys(variables).forEach(k => ctx.var(k, variables[k]))

    Context.push(ctx)
    const task = create_task2(command!, cmds)
    console.log(task);
    Context.pop()
  //   console.log(WK.render(task.Exec as string))
  }

  // let [options, argv] = getOptions()

  // const path = options.commands
  // VERBOSE = !!options.verbose

  // Context.global("wk::command", argv.shift())
  // argv.forEach((a,i) => Context.global(`wk::arg${i}`, a))
  // setOptions(options)

  // Context.push(Context.create())
  // const [variables, commands, config] = parse_file(path)
  // setOptions(Object.assign(options, config))
  // Object.keys(variables).forEach(k => Context.global(k, variables[k]))
  // Context.pop()

  // if (!Context.global("wk::command") || !commands[Context.global("wk::command") as string]) {
  //   help(commands)
  // } else {
  //   const ctx = Context.create()
  //   ctx.args = argv
  //   // ctx.merge_variables(variables)

  //   Context.push(ctx)
  //   const task = create_task(Context.global("wk::command") as string, commands)
  //   Context.pop()
  //   // @ts-ignore
  //   console.log(WK.parse(task.Exec));

  // //   await run(task)
  // }
}

main()
  .catch(e => {
    if (e instanceof Error) {
      console.log(VERBOSE ? e : e.message)
    } else {
      console.log(e)
    }
  })