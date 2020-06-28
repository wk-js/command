export type TagValue = Tags['If'] | Tags['Ref'] | Tags['Select'] | Tags['Split'] | Tags['Sub'] | string | boolean
export type TagCondition = Tags['Equals'] | Tags['DeepEquals'] | Tags['And'] | Tags['Or'] | Tags['Not'] | Tags['Empty'] | Tags['Regex'] | boolean
export type TagSequence = Tags['Split'] | Scalar[]

export type Tags = {
  If: { If: [TagCondition, TagValue, TagValue] }
  Ref: { Ref: string }
  Select: { Select: [number, TagValue[]] }
  Split: { Split: [TagValue, TagValue] }
  Sub: { Sub: TagValue | [TagValue, Record<string, TagValue>] }
  Equals: { Equals: [TagValue, TagValue] }
  Regex: { Regex: [TagValue, TagValue] }
  DeepEquals: { DeepEquals: [TagValue, TagValue] }
  And: { And: TagCondition[] }
  Or: { Or: TagCondition[] }
  Not: { Not: [TagCondition] }
  Empty: { Empty: [TagValue] }
  None: { None: string }
}

export interface CommandOptions {
  desc?: string
  descargs?: string
  cwd?: string
  name?: string
  env?: Record<string, TagValue>
  variables?: Record<string, TagValue>,
}

export type Command = string | [string, CommandOptions]

export interface Command2 extends Record<string, Commands2> {}

export type Commands = {
  [key: string]: Command
}

export type Commands2 = {
  [key: string]: string
}

export type Task = TaskSerie | TaskParallel | TaskExec | string
export type TaskExec = { Exec: Task | string, Options: CommandOptions }
export type TaskSerie = { Serie: Task[], Options: CommandOptions }
export type TaskParallel = { Parallel: Task[], Options: CommandOptions }

export type WKConfig = {
  commands: string
  verbose: boolean
  debug: boolean
  nocolor: boolean
}

export type WKOptions = WKConfig & {
  command: string
  argv: string[]
}

export type DStringBool = Record<string, string|boolean>
export type DScalar = Record<string, string|boolean|number>

export type Scalar = string | boolean