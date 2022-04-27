# AS-JSON

# Total time

46 hours 36m

**JSON encoder/decoder for AssemblyScript**

## Installation

```bash
~ npm install json-as
~ yarn add json-as
```

Add the transform to your `asc` command

```bash
--transform json-as/transform
```

Or, add it to `asconfig.json`

```
{
  "options": {
    "transform": "json-as/transform"
  }
}
```

## Support

- ✅ Objects
- ✅ Arrays
- ✅ Numbers
- ✅ Integers
- ✅ Null
- ✅ Dynamic Arrays
- ✅ Dynamic Types
- ✅ Dynamic Objects
- ✅ Whitespace

## Usage

```js
import { JSON } from 'json-as'

@json
class JSONSchema {
  firstName: string
  lastName: string
  age: i32
}

const data: JSONSchema = {
  firstName: 'Emmet',
  lastName: 'Smith',
  age: 23,
}

const stringified = JSON.stringify(data)
// '{"firstName":"Emmet","lastName":"Smith","age":23}'
console.log(`Stringified: ${stringified}`)

const parsed = JSON.parse<JSONSchema>(stringified)
// { firstName: "Emmet", lastName: "Smith", age: 23 }
console.log(`Parsed: ${JSON.stringify(parsed)}`)
```

## Todo

Add [Envy](https://github.com/jtenner/envy) as the testing framework. Remove as-pect

Finish parsing objects into classes

Work on jsonType and support dynamic types

Optimize!
