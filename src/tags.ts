import { TagCondition, TagValue, Tags, Scalar, TagSequence } from "./types"
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
]

export function validate(value: any, message: string, type?: "string" | "number" | "boolean" | "object" | "array") {
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

export function get_key(data: TagValue | TagCondition | TagSequence): keyof Tags {
  const keys = Object.keys(data)
  if (keys.length === 1 && TAGS.indexOf(keys[0]) > -1) {
    const k = keys[0] as keyof Tags
    return k
  }
  return 'None'
}

export function has_key(data: any, key: string) {
  return data !== null && typeof data === 'object' && Object.keys(data).length === 1 && data.hasOwnProperty(key)
}

export function Any(data: TagValue | TagCondition | TagSequence): Scalar | Scalar[] {
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
      {
        return Scalar(data)
      }

    case "Split": {
      return Sequence(data as TagSequence)
    }
  }

  return ''
}

export function Scalar(data: TagValue | TagCondition): Scalar {
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
        return Value(data as TagValue)
      }

    case "Equals":
    case "DeepEquals":
    case "And":
    case "Or":
    case "Not":
    case "Empty":
      {
        return Condition(data as TagCondition)
      }
  }

  return ''
}

export function Sequence(data: TagSequence): Scalar[] {
  const key = get_key(data)

  switch (key) {
    case "Split":
      {
        return Split(data as Tags['Split'])
      }
  }

  return []
}

export function Split({ Split: [delimiter, value] }: Tags['Split']): Scalar[] {
  validate(delimiter, '[!Split] Invalid delimiter')
  validate(value, '[!Split] Invalid value')

  const d = Scalar(delimiter)
  const v = Scalar(value)

  validate(d, '[!Split] Invalid delimiter', 'string')
  validate(v, '[!Split] Invalid value', 'string')

  return (v as string).split(d as string)
}

export function Value(data: TagValue): string|boolean {
  const key = get_key(data)

  switch (key) {
    case "If": {
      return If(data as Tags['If'])
    }
    case "Ref": {
      return Ref(data as Tags['Ref'])
    }
    case "Select": {
      return Select(data as Tags['Select'])
    }
    case "Sub": {
      return Sub(data as Tags['Sub'])
    }
  }

  return ''
}

export function If({ If: [condition, v0, v1] }: Tags['If']): Scalar {
  validate(condition, '[!If] Invalid condition')
  validate(v0, '[!If] Invalid then')
  validate(v1, '[!If] Invalid else')

  if (Scalar(condition)) {
    return Scalar(v0)
  }

  return Scalar(v1)
}

export function Ref({ Ref }: Tags['Ref']): Scalar {
  validate(Ref, '[!Ref] Invalid reference key', 'string')

  const { references } = Context.current()
  const value = references[Ref]
  // validate(value, `[!Ref] Reference ${Ref} does not exist`)

  return value || ''
}

export function Select({ Select: [index, values] }: Tags['Select']): Scalar {
  validate(index, '[!Select] Invalid index', 'number')
  validate(index, '[!Select] Invalid values', 'array')

  const value = values[index]
  validate(value, '[!Select] Index out of bounds')

  return Scalar(value)
}

export function Sub({ Sub }: Tags['Sub']): Scalar {
  const { references } = Context.current()

  if (Array.isArray(Sub)) {
    validate(Sub[0], `[!Sub] Invalid value "${Sub[0]}"`)
    validate(Sub[1], '[!Sub] Invalid map', 'object')

    const str = Scalar(Sub[0])
    const vars: Record<string, Scalar> = {}
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

export function Condition(data: TagCondition): Scalar {
  const key = Object.keys(data)[0] as keyof typeof TAGS

  switch (key) {
    case "Equals": {
      return Equals(data as Tags['Equals'])
    }
    case "DeepEquals": {
      return DeepEquals(data as Tags['DeepEquals'])
    }
    case "And": {
      return And(data as Tags['And'])
    }
    case "Or": {
      return Or(data as Tags['Or'])
    }
    case "Not": {
      return Not(data as Tags['Not'])
    }
    case "Empty": {
      return Empty(data as Tags['Empty'])
    }
  }

  return false
}

export function Equals({ Equals: [v0, v1] }: Tags['Equals']): boolean {
  validate(v0, '[!Equals] Invalid v0')
  validate(v1, '[!Equals] Invalid v1')
  return Any(v0) === Any(v1)
}

export function DeepEquals({ DeepEquals: [v0, v1] }: Tags['DeepEquals']): boolean {
  validate(v0, '[!DeepEquals] Invalid v0')
  validate(v1, '[!DeepEquals] Invalid v1')
  return JSON.stringify(Any(v0)) === JSON.stringify(Any(v1))
}

export function And({ And }: Tags['And']): boolean {
  validate(And, '[!And] Invalid array', 'array')

  for (const condition of And) {
    validate(And, '[!And] Invalid condition')
    if (!Scalar(condition)) return false
  }
  return true
}

export function Or({ Or }: Tags['Or']): boolean {
  validate(Or, '[!Or] Invalid array', 'array')

  for (const condition of Or) {
    validate(Or, '[!Or] Invalid condition')
    if (Scalar(condition)) return true
  }
  return false
}

export function Not({ Not }: Tags['Not']): boolean {
  validate(Or, '[!Not] Invalid value')
  const b = Scalar(Not)
  return !b
}

export function Empty({ Empty }: Tags['Empty']): boolean {
  validate(Empty, '[!Empty] Invalid value', 'array')

  const value = Scalar(Empty[0])
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0
  }

  throw `[!Empty] Invalid value to check "${value}"`
}