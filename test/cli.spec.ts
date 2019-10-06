import "mocha";
import { writeFile, ensureDir, removeDir } from "lol/js/node/fs";
import * as assert from "assert";
import * as Path from "path";
import { execute } from '../js/utils'

const LOAD_PATH = 'tmp/test-units'

before(async () => {
  await ensureDir(LOAD_PATH)

  await writeFile(`[commands]
  ls = "ls"
  `, Path.join(LOAD_PATH, 'commands.toml'))

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

  it("List commands and help", async () => {
    const p = execute("wk", [ 'ls' ], { stdio: "pipe", cwd: LOAD_PATH })
    const [code, _] = await p.promise
    assert.equal(code, 0)
  })

})