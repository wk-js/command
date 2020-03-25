import { parse_file } from "./yaml"
import { WKOptions } from "./types"
import { help, create_task } from "./task"
import { run } from "./exec"
import { Context } from "./context"
import { parse } from "./argv"
import { join } from "path"

let VERBOSE = false

function getOptions(): [WKOptions, string[]] {
  let _wk_argv: string[] = []
  let _argv = process.argv.slice(2)
  let [wk0, tmp] = parse(process.argv.slice(2))

  const index = _argv.indexOf(tmp[0])
  if (tmp[0] && index > -1) {
    _wk_argv = _argv.splice(0, index)
    let [wk1] = parse(_wk_argv)
    return [wk1, _argv]
  }

  return [wk0, []]
}

function setOptions(refs: Record<string, string|boolean>, options: WKOptions) {
  refs["WK::Verbose"] = options.verbose
  refs["WK::Debug"] = options.debug
  refs["WK::NoColor"] = options.nocolor
  refs["WK::CommandPath"] = join(process.cwd(), options.commands)
}

async function main() {
  let [options, argv] = getOptions()

  const path = options.commands
  VERBOSE = !!options.verbose

  let refs: Record<string, string|boolean> = Object.assign({}, process.env as Record<string, string>)
  refs["WK::Command"] = argv.shift() || ''
  refs["WK::Args"] = argv.join(' ')
  setOptions(refs, options)
  argv.forEach((a, i) => refs[`WK::Arg${i+1}`] = a)

  const ctx = Context.create()
  ctx.references = refs
  Context.push(ctx)
  const [variables, commands, config] = parse_file(path)
  setOptions(refs, Object.assign(options, config))

  if (!refs["WK::Command"] || !commands[refs["WK::Command"]]) {
    help(commands)
  } else {
    refs['command'] = refs["WK::Command"]
    refs["args"] = refs["WK::Args"]
    argv.forEach((a, i) => refs[`arg${i+1}`] = a)

    ctx.references = Object.assign(refs, variables)

    const task = create_task(refs["WK::Command"], commands)
    await run(task)
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