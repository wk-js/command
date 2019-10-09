import { create_list, print_tasks, print_help, print_results, isCommand } from './cli/utils';
import { parse, filter, ARGv } from "./utils";
import { Runner } from './runner';
import * as Log from './log';
import { load, lookup, Config } from './importer';

interface WKArgv {
  global?: boolean;
  commands?: string;
  verbose?: boolean;
  silent?: boolean;
}

async function cli({ task, wk, vars }: { task: ARGv, wk: WKArgv, vars: ARGv }) {
  let config: Config

  const importGlobals = typeof wk.global == 'boolean' ? wk.global : false

  if (wk.commands) {
    config = await load(wk.commands, importGlobals)
  } else {
    config = await lookup(importGlobals)
  }

  const runner = new Runner(create_list(config, vars))

  if (typeof task['0'] == 'string') {
    const results = runner.run(task['___argv'] as string)
    print_results(await results)
    return results
  } else {
    print_help()
    process.stdout.write('\n')
    print_tasks(runner.tasks, wk.verbose)
  }
}

async function main() {
  const parsed = parse(process.argv.slice(2))
  const wk   = filter(parsed, /wk\./) as unknown as WKArgv
  const task = filter(parsed, /(wk|var)\./, true)
  const vars = filter(parsed, /var\./)

  Log.silent(wk.silent)

  try {
    await cli({ wk, task, vars })
  } catch(e) {
    if (wk.verbose) {
      Log.err(e)
    } else {
      Log.err(e.message)
    }
  }
}

main()
process.on('SIGINT', () => {})