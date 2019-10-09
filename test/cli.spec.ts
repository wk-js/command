import "mocha";
import { writeFile, ensureDir, removeDir } from "lol/js/node/fs";
import * as assert from "assert";
import * as Path from "path";
import { execute } from '../js/utils'
import { MemoryStream } from "lol/js/node/memory-stream";

const LOAD_PATH = 'tmp/test-units'

function run(command: string) {
  return execute("../../bin/wk.js", command.split(' '), { stdio: "pipe", cwd: LOAD_PATH })
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

[commands.welcome]
command = "echo Welcome"
dependsOn = [ "hello" ]

[commands.welcome1]
command = "echo Welcome"
dependsOn = [ "hello --var.name Tom" ]

[aliases.ls_cwd]
command = "ls"
cwd = "others"
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

describe("Command Line", async () => {

  it("Run", async () => {
    const p = run('ls')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `commands.toml\nfile.txt.ejs\nfile1.txt\nfile2.txt\nfile3.txt\nothers\nsub0\n`);
    assert.equal(code, 0)
  })

  it("Run imports", async () => {
    const p = run('test')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `Test something\n`);
    assert.equal(code, 0)
  })

  it("Transfer parameters", async () => {
    const p = run('ls -a')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `.\n..\ncommands.toml\nfile.txt.ejs\nfile1.txt\nfile2.txt\nfile3.txt\nothers\nsub0\n`);
    assert.equal(code, 0)
  })

  it("Alias, cwd and override", async () => {
    const p = run('ls_cwd')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `commands.toml\nfile4.txt\nfile5.txt\nfile6.txt\n`);
    assert.equal(code, 0)
  })

  it("Dependencies", async () => {
    const p = run('welcome')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `Hello John!\nWelcome\n`);
    assert.equal(code, 0)
  })

  it("Dependencies and variables", async () => {
    const p = run('welcome1')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `Hello Tom!\nWelcome\n`);
    assert.equal(code, 0)
  })

  it("Variable", async () => {
    const p = run('hello')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `Hello John!\n`);
    assert.equal(code, 0)
  })

  it("Override variable", async () => {
    const p = run('hello --var.name Mark')
    const [code, _] = await p.promise
    const stdout = p.stdout as MemoryStream
    assert.equal(stdout.data('utf-8'), `Hello Mark!\n`);
    assert.equal(code, 0)
  })

})