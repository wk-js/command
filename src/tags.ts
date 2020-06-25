import * as Types from "./types"
import { template2 } from 'lol/js/string/template'
import { Context } from "./context"

const SCALAR_REG = /string|boolean|number/i

export const TAGS = [
  // Value
  'If',
  'Ref',
  'Select',
  'Split',
  'Sub',
  'Exec',

  // Condition
  'Equals',
  'DeepEquals',
  'And',
  'Or',
  'Not',
  'Empty',
  'Regex',
]

export function validate(value: any, message: string, type?: "string" | "number" | "boolean" | "object" | "array") {
  let valid = true
  if (type) {
    if (type === 'array') {
      valid = valid && Array.isArray(value)
    } else {
      valid = valid && (typeof value === type)
    }
  }

  valid = valid && (value !== undefined && value !== null)
  if (!valid) throw message
}

export function get_key(data: Types.TagValue | Types.TagCondition | Types.TagSequence): keyof Types.Tags {
  const keys = Object.keys(data)
  if (keys.length === 1 && TAGS.indexOf(keys[0]) > -1) {
    const k = keys[0] as keyof Types.Tags
    return k
  }
  return 'None'
}

export function has_key(data: any, key: string) {
  return data !== null && typeof data === 'object' && Object.keys(data).length === 1 && data.hasOwnProperty(key)
}

export function Any(data: Types.TagValue | Types.TagCondition | Types.TagSequence): Types.Scalar | Types.Scalar[] {
  if (typeof data !== 'object') {
    if (SCALAR_REG.test(typeof data)) return data
    return ''
  }

  if (Array.isArray(data)) {
    return data.map(d => Scalar(d))
  }

  const key = get_key(data)

  switch (key) {
    case "If":
    case "Ref":
    case "Select":
    case "Sub":
    case "Equals":
    case "DeepEquals":
    case "And":
    case "Or":
    case "Not":
    case "Empty":
    case "Regex":
      {
        return Scalar(data)
      }

    case "Split": {
      return Sequence(data as Types.TagSequence)
    }
  }

  return ''
}

export function Scalar(data: Types.TagValue | Types.TagCondition): Types.Scalar {
  if (typeof data !== 'object') {
    if (SCALAR_REG.test(typeof data)) return data
    return ''
  }

  const key = get_key(data)

  switch (key) {
    case "If":
    case "Ref":
    case "Select":
    case "Sub":
      {
        return Value(data as Types.TagValue)
      }

    case "Equals":
    case "DeepEquals":
    case "And":
    case "Or":
    case "Not":
    case "Empty":
    case "Regex":
      {
        return Condition(data as Types.TagCondition)
      }
  }

  return ''
}

export function Sequence(data: Types.TagSequence): Types.Scalar[] {
  if (typeof data !== 'object') {
    if (SCALAR_REG.test(typeof data)) return [data]
    return []
  }

  const key = get_key(data)

  switch (key) {
    case "Split":
      {
        return Split(data as Types.Tags['Split'])
      }
  }

  return []
}

export function Split({ Split: [delimiter, value] }: Types.Tags['Split']): Types.Scalar[] {
  validate(delimiter, '[!Split] Invalid delimiter')
  validate(value, '[!Split] Invalid value')

  const d = Scalar(delimiter)
  const v = Scalar(value)

  validate(d, '[!Split] Invalid delimiter', 'string')
  validate(v, '[!Split] Invalid value', 'string')

  return (v as string).split(d as string)
}

export function Value(data: Types.TagValue): Types.Scalar {
  const key = get_key(data)

  switch (key) {
    case "If": {
      return If(data as Types.Tags['If'])
    }
    case "Ref": {
      return Ref(data as Types.Tags['Ref'])
    }
    case "Select": {
      return Select(data as Types.Tags['Select'])
    }
    case "Sub": {
      return Sub(data as Types.Tags['Sub'])
    }
  }

  return ''
}

export function If({ If: [condition, v0, v1] }: Types.Tags['If']): Types.Scalar {
  validate(condition, '[!If] Invalid condition')
  validate(v0, '[!If] Invalid then')
  validate(v1, '[!If] Invalid else')

  if (Scalar(condition)) {
    return Scalar(v0)
  }

  return Scalar(v1)
}

export function Ref({ Ref }: Types.Tags['Ref']): Types.Scalar {
  validate(Ref, '[!Ref] Invalid reference key', 'string')

  const { variables: references } = Context.export()
  const value = references[Ref]
  // validate(value, `[!Ref] Reference ${Ref} does not exist`)

  return value || ''
}

export function Select({ Select: [index, values] }: Types.Tags['Select']): Types.Scalar {
  validate(index, '[!Select] Invalid index', 'number')
  validate(index, '[!Select] Invalid values', 'array')

  const value = values[index]
  validate(value, '[!Select] Index out of bounds')

  return Scalar(value)
}

export function Sub({ Sub }: Types.Tags['Sub']): Types.Scalar {
  const { variables: references } = Context.export()

  if (Array.isArray(Sub)) {
    validate(Sub[0], `[!Sub] Invalid value "${Sub[0]}"`)
    validate(Sub[1], '[!Sub] Invalid map', 'object')

    const str = Scalar(Sub[0])
    const vars: Record<string, Types.Scalar> = {}
    for (const key in Sub[1]) {
      if (Sub[1].hasOwnProperty(key)) {
        const value = Sub[1][key]
        vars[key] = Scalar(value)
      }
    }
    validate(str, `[!Sub] Invalid value "${str}"`, 'string')
    return template2(str as string, Object.assign({}, references, vars))
  }

  validate(Sub, `[!Sub] Invalid value "${Sub}"`)
  const str = Scalar(Sub)
  validate(str, `[!Sub] Invalid value "${str}"`, 'string')
  return template2(str as string, references)
}

export function Condition(data: Types.TagCondition): Types.Scalar {
  const key = Object.keys(data)[0] as keyof Types.Tags

  switch (key) {
    case "Equals": {
      return Equals(data as Types.Tags['Equals'])
    }
    case "DeepEquals": {
      return DeepEquals(data as Types.Tags['DeepEquals'])
    }
    case "And": {
      return And(data as Types.Tags['And'])
    }
    case "Or": {
      return Or(data as Types.Tags['Or'])
    }
    case "Not": {
      return Not(data as Types.Tags['Not'])
    }
    case "Empty": {
      return Empty(data as Types.Tags['Empty'])
    }
    case "Regex": {
      return Regex(data as Types.Tags['Regex'])
    }
  }

  return false
}

export function Equals({ Equals: [v0, v1] }: Types.Tags['Equals']): boolean {
  validate(v0, '[!Equals] Invalid v0')
  validate(v1, '[!Equals] Invalid v1')
  return Any(v0) === Any(v1)
}

export function DeepEquals({ DeepEquals: [v0, v1] }: Types.Tags['DeepEquals']): boolean {
  validate(v0, '[!DeepEquals] Invalid v0')
  validate(v1, '[!DeepEquals] Invalid v1')
  return JSON.stringify(Any(v0)) === JSON.stringify(Any(v1))
}

export function And({ And }: Types.Tags['And']): boolean {
  validate(And, '[!And] Invalid array', 'array')

  for (const condition of And) {
    validate(condition, '[!And] Invalid condition', 'boolean')
    if (!Scalar(condition)) return false
  }
  return true
}

export function Or({ Or }: Types.Tags['Or']): boolean {
  validate(Or, '[!Or] Invalid array', 'array')

  for (const condition of Or) {
    validate(condition, '[!Or] Invalid condition', 'boolean')
    if (Scalar(condition)) return true
  }
  return false
}

export function Not({ Not }: Types.Tags['Not']): boolean {
  validate(Not, '[!Not] Invalid value' , 'array')
  const b = Scalar(Not[0])
  return !b
}

export function Empty({ Empty }: Types.Tags['Empty']): boolean {
  validate(Empty, '[!Empty] Invalid value', 'array')

  const value = Scalar(Empty[0])
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0
  }

  throw `[!Empty] Invalid value to check "${value}"`
}

export function Regex({ Regex: [v0, v1] }: Types.Tags['Regex']): boolean {
  validate(v0, '[!Regex] Invalid v0')
  validate(v1, '[!Regex] Invalid v1', "string")
  const value = Any(v0).toString()
  const reg_str = (v1 as string).split('/')
  const reg = new RegExp(reg_str[1], reg_str[2])
  return reg.test(value)
}