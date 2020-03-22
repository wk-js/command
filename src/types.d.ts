export type TagValue = Tags['If'] | Tags['Ref'] | Tags['Select'] | Tags['Split'] | Tags['Sub'] | string
export type TagCondition = Tags['Equals'] | Tags['DeepEquals'] | Tags['And'] | Tags['Or'] | Tags['Not'] | Tags['Empty'] | boolean
export type TagSequence = Tags['Split'] | Scalar[]

export type Tags = {
  If: { If: [TagCondition, TagValue, TagValue] }
  Ref: { Ref: string }
  Select: { Select: [number, TagValue[]] }
  Split: { Split: [TagValue, TagValue] }
  Sub: { Sub: TagValue | [TagValue, Record<string, TagValue>] }
  Equals: { Equals: [TagValue, TagValue] }
  DeepEquals: { DeepEquals: [TagValue, TagValue] }
  And: { And: TagCondition[] }
  Or: { Or: TagCondition[] }
  Not: { Not: TagCondition }
  Empty: { Empty: [TagValue] }
  None: { None: string }
}

export interface CommandOptions {
  desc?: string
  descargs?: string
  cwd?: string
  parallel?: boolean
}

export type Commands = {
  [key: string]: string[]
}

export type Task = TaskSerie | TaskParallel | TaskExec | string
export type TaskExec = { Exec: Task | string, Options: CommandOptions }
export type TaskSerie = { Serie: Task[], Options: CommandOptions }
export type TaskParallel = { Parallel: Task[], Options: CommandOptions }

export type WKOptions = {
  commands: string
  verbose: boolean
  debug: boolean
}

export type Scalar = string | boolean