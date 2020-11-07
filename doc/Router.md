## Router class

When a request arrives at the application, the `Router` class can parse the request by resolving it against the defined routes. These routes are usually defined through the 'application.json' file, although when no routes are supplied, the router will use some default defined routes.

## Class methods

There is actually one single method that the `Router` class accepts.

- [parse (*request*)](#parse-request)

#### `parse (request)`

Will parse the request that is passed on from the `Application` class and return a promise for an object with the parsed results. The `request` object should at least contain the following properties:

- `method`: the HTTP method used (i.e. GET, POST, PUT, PATCH, etc.)
- `path`: the requested path, including any parameters (e.g. /Document:home?render=html)
- `payload`: any additionally streamed data (for methods POST, PUT, etc.)

The `parse` method is an asynchronous function that returns a `Promise`. The object that is resolved has a `JResponse` format that either returns a `status` of `"success"` with the parsed results contained in `data`, or any other status indicating a failed result.

```js
// Example

import Cubo from '@cubo-cms/node-framework'

Cubo.load()
  .then(() => {
    let result = Cubo.Router.parse({ method: 'GET', path: '/Document:home?render=html' })
    console.log(result)
  }
  .catch((error) => { console.error(error) })

// Expected output: object with parsed results { method: 'get', controller: 'Document', id: 'home', render: 'html' }
```
