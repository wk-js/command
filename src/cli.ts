import { parse_file } from "./yaml"
import { WKOptions } from "./types"
import { help, create_task } from "./task"
import { run } from "./exec"
import { Context } from "./context"
import { parse } from "./argv"
import { join } from "path"

let VERBOSE = false

async function main() {
  let [options, argv] = parse(process.argv.slice(2))

  const path = options.commands
  VERBOSE = !!options.verbose

  let refs: Record<string, string|boolean> = Object.assign({}, process.env as Record<string, string>)
  refs["WK::Command"] = argv.shift() || ''
  refs["WK::Args"] = argv.join(' ')
  refs["WK::Verbose"] = options.verbose
  refs["WK::Debug"] = options.debug
  refs["WK::CommandPath"] = join(process.cwd(), options.commands)
  argv.forEach((a, i) => refs[`WK::Arg${i+1}`] = a)

  const ctx = Context.create()
  ctx.references = refs
  Context.push(ctx)
  const [variables, commands] = parse_file(path)

  if (!refs["WK::Command"] || !commands[refs["WK::Command"]]) {
    help(commands)
  } else {
    ctx.references['command'] = refs["WK::Command"]
    ctx.references["args"] = refs["WK::Args"]
    argv.forEach((a, i) => ctx.references[`arg${i+1}`] = a)

    ctx.references = {
      ...ctx.references,
      ...variables,
    }

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