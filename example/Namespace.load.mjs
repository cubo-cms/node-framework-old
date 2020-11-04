import Cubo from '@cubo-cms/node-framework'

Cubo.register('./mylib')
  .then((registry) => { return Cubo.load(); })
  .then((namespace) => { console.log(namespace) })
  .catch((error) => { console.error(error) })
  .finally(() => { console.log('*** do something ***') })
