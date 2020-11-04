import Cubo from '@cubo-cms/node-framework'

Cubo.register('./mylib')
  .then((registry) => { console.log(registry) })
  .catch((error) => { console.error(error) })
  .finally(() => { console.log('*** do something ***') })
