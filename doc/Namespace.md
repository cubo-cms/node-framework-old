# Cubo CMS

## Namespace class

The `Namespace` class provides the web application you are developing with a general namespace through which all the framework classes are available. It is designed in a way that you can extend the namespace with additional classes, or use the class independently to provide your own classes through a different namespace.

The class does this provisioning in two steps:

1. Locate all class modules in a subtree.
2. Load these classes and present them as a single namespace.

Note that the actual namespace does not need to be named `Namespace`, or `Cubo` as we use in our examples.

## Class methods

- [register (*searchPath*, *basePath*)](#static-register-searchpath-basepath)
- [load (*registry*)](#static-load-registry)

### Register methods

#### `static register (searchPath, basePath)`

Will locate all class modules, typically **\*.js** or **\*.mjs** scripts, under a file tree indicated by `searchPath`. This file tree is a relative path below a `basePath`, which by default is your application root. The function returns a promise to give you an object of registered classes with their dependencies.

```js
// Example

import Cubo from '@cubo-cms/node-framework'

Cubo.register('./mylib')
  .then((registry) => { console.log(registry) })
  .catch((error) => { console.error(error) })
  .finally(() => { *** do something *** })

// Expected output: object with modules
```

#### `static load (registry)`

Will load all class modules into the namespace. The registry parameter is optional, but allows for loading class modules from a different registry.

```js
// Example

import Cubo from '@cubo-cms/node-framework'

Cubo.register('./mylib')
  .then((registry) => { return Cubo.load() })
  .then((namespace) => { console.log(namespace) })
  .catch((error) => { console.error(error) })
  .finally(() => { *** do something *** })

// Expected output: namespace object showing loaded classes
```

#### `static basePath`

Worth mentioning is this getter function that retrieves the path to the root of the application.

```js
// Example

import Cubo from '@cubo-cms/node-framework'

console.log(Cubo.basePath)

// Expected output: path to the root of your application
```
