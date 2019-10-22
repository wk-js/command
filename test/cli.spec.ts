import "mocha";
import { writeFile, ensureDir, removeDir } from "lol/js/node/fs";
import * as assert from "assert";
import * as Path from "path";
import { execute } from '../js/utils'
import { MemoryStream } from "lol/js/node/memory-stream";
import { ChildProcess } from "child_process";
import { Runner } from "../js/runner";
import { Level } from "../js/log";

const LOAD_PATH = 'tmp/test-units'
const wk = Path.join(__dirname, '../bin/wk.js')

async function run(command?: string) : Promise<[number, string]> {
  let p: { child: ChildProcess, promise: () => Promise<[number, string, ChildProcess]> }
  if (command) {
    p = execute(wk, command.split(' '), { stdio: "pipe", cwd: LOAD_PATH })
  } else {
    p = execute(wk, [], { stdio: "pipe", cwd: LOAD_PATH })
  }
  const m = new MemoryStream()
  p.child.stdout.pipe(m)
  const [code, _] = await p.promise()
  return [code, m.data('utf8') as string]
}

before(async () => {
  await ensureDir(LOAD_PATH)

  await writeFile(`
imports = [ "./others/commands.toml" ]

[commands]
ls = "ls"

[commands.hello]
command = "echo Hello \${name}!"
variables = { name = "John" }
description = "Call hello"

[commands.welcome]
command = "echo Welcome"
dependsOn = [ "hello" ]

[commands.welcome1]
command = "echo Welcome"
dependsOn = [ "hello --var.name Tom" ]

[aliases.ls_cwd]
command = "ls"
cwd = "others"
description = "Call ls"

[concurrents.hellos]
commands = [ "hello --var.name Paul", "welcome" ]
description = "Call hello and welcome"

[commands.echo]
command = "echo \${message}"
aliases = [
  { name = "world", variables = { message = "Hello World" } }, 
  { name = "john" , variables = { message = "Hello John"  } } 
]

  `, Path.join(LOAD_PATH, 'commands.toml'))
  await writeFile(`
[commands]
test = "echo Test something"
  `, Path.join(LOAD_PATH, 'others/commands.toml'))

  await writeFile("", Path.join(LOAD_PATH, 'file1.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file2.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file3.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'file.txt.ejs'))

  await ensureDir(Path.join(LOAD_PATH, 'others'))
  await writeFile("", Path.join(LOAD_PATH, 'others', 'file4.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'others', 'file5.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'others', 'file6.txt'))

  await ensureDir(Path.join(LOAD_PATH, 'sub0', 'sub1'))
  await writeFile("", Path.join(LOAD_PATH, 'sub0/sub1', 'file7.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub0/sub1', 'file8.txt'))
  await writeFile("", Path.join(LOAD_PATH, 'sub0/sub1', 'file9.txt'))
})

after(async () => {
  await removeDir(LOAD_PATH)
})

describe.only("Command Line", async () => {

  it.only("List sub aliases", async () => {
    const [code, stdout] = await run()
    assert.equal(true, !!stdout.match(new RegExp(`echo`)));
    assert.equal(true, !!stdout.match(new RegExp(`echo:john`)));
    assert.equal(true, !!stdout.match(new RegExp(`echo:world`)));
    assert.equal(code, 0)
  })

  it("Descriptions", async () => {
    const [code, stdout] = await run()
    assert.equal(true, !!stdout.match(new RegExp(`Call hello`)));
    assert.equal(true, !!stdout.match(new RegExp(`Call ls`)));
    assert.equal(true, !!stdout.match(new RegExp(`Call hello and welcome`)));
    assert.equal(code, 0)
  })

  it("Run", async () => {
    const [code, stdout] = await run('ls')
    assert.equal(stdout, `commands.toml\nfile.txt.ejs\nfile1.txt\nfile2.txt\nfile3.txt\nothers\nsub0\n`);
    assert.equal(code, 0)
  })

  it("Run imports", async () => {
    const [code, stdout] = await run('test')
    assert.equal(stdout, `Test something\n`);
    assert.equal(code, 0)
  })

  it("Transfer parameters", async () => {
    const [code, stdout] = await run('ls -a')
    assert.equal(stdout, `.\n..\ncommands.toml\nfile.txt.ejs\nfile1.txt\nfile2.txt\nfile3.txt\nothers\nsub0\n`);
    assert.equal(code, 0)
  })

  it("Alias, cwd and override", async () => {
    const [code, stdout] = await run('ls_cwd')
    assert.equal(stdout, `commands.toml\nfile4.txt\nfile5.txt\nfile6.txt\n`);
    assert.equal(code, 0)
  })

  it("Dependencies", async () => {
    const [code, stdout] = await run('welcome')
    assert.equal(stdout, `Hello John!\nWelcome\n`);
    assert.equal(code, 0)
  })

  it("Dependencies and variables", async () => {
    const [code, stdout] = await run('welcome1')
    assert.equal(stdout, `Hello Tom!\nWelcome\n`);
    assert.equal(code, 0)
  })

  it("Variable", async () => {
    const [code, stdout] = await run('hello')
    assert.equal(stdout, `Hello John!\n`);
    assert.equal(code, 0)
  })

  it("Override variable", async () => {
    const [code, stdout] = await run('hello --var.name Mark')
    assert.equal(stdout, `Hello Mark!\n`);
    assert.equal(code, 0)
  })

  it("Concurrents", async () => {
    const [code, stdout] = await run('hellos')
    assert.equal(stdout, `Hello Paul!\nHello John!\nWelcome\n`);
    assert.equal(code, 0)
  })

})

describe("API", async () => {

  it("Run", async () => {
    const runner = new Runner()
    runner.logLevel(Level.SILENT)
    runner.tasks.add("ls", "ls")
    const result = await runner.run("ls")
    assert.deepEqual(result, [{ success: true, taskName: 'ls' }])
  })

})