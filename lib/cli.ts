import { create_list, WKOptions, extract_wks } from './utils/cli'
import { parse, filter, ARGv } from "./utils/argv"
import { Runner } from './runner'
import * as Log from './log'
import * as Print from './utils/print'
import { load, lookup, Config } from './importer'

async function cli({ task, wk }: { task: ARGv, wk: WKOptions }) {
  let config: Config

  const importGlobals = typeof wk.global == 'boolean' ? wk.global : false

  if (wk.commands) {
    config = await load(wk.commands, importGlobals)
  } else {
    config = await lookup(importGlobals)
  }

  const runner = new Runner(create_list(config))

  if (typeof task['0'] == 'string') {
    const results = runner.run(task['___argv'] as string)
    Print.results(await results)
    return results
  } else {
    Print.helpAndTasks(runner.tasks)
  }
}

async function main() {
  const [ wks, argv ] = extract_wks(process.argv.slice(2))

  const wk = parse(wks) as unknown as WKOptions
  const task = parse(argv)

  if (typeof wk.log === 'boolean') {
    Log.level(Log.Level.FULL)
  } else if (!isNaN(parseInt(wk.log))) {
    Log.level(parseInt(wk.log))
  }

  try {
    await cli({ wk, task })
  } catch(e) {
    Print.err(e)
  }
}

main()
process.on('SIGINT', () => {})