/** @package        @cubo-cms/node-framework
  * @module         /Namespace.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import path from 'path';

import Core from './lib/Core.mjs';
import Log from './lib/Log.mjs';

export default class Namespace extends Core {
  /** @static @property {object} default - holds default settings for class
    **/
  static default = {
    useGlobal: false,       // option to publish namespace objects globally
    includeExtensions: ['.mjs', '.js']
  };
  /** @property {object} default - holds default settings for class
    **/
  default = {
    searchPath: '#/lib'    // search path to locate modules
  };

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
  }

  /** @function register(searchPath,basePath)
    * @param {string} searchPath - path to examine; default if none given
    * @param {string} basePath - base path for module path; defaults to current directory
    * @return {object}
    **/
  register(searchPath = this.default.searchPath, basePath = Namespace.path) {
    return new Promise((resolve, reject) => {
      this.registerPath(Namespace.resolvePath(searchPath), basePath)
        .then((namespace) => {
          Log.info({ message: `Namespace completed registering modules`, source: this.name, payload: this.data });
          resolve(this.data);
        }).catch((error) => {
          Log.error({ message: error, source: this.name });
          reject(error);
        });
    });
  }
  /** @function registerModule(registration,moduleName)
    * function register - returns the registration of the module
    * @param {object} registration - object containing module registration info
    * @param {string} moduleName - (optional) name of module; allows override/alias
    * @return {object}
    **/
  registerModule(registration, moduleName = registration.name) {
    if(typeof moduleName === 'undefined') {
      return undefined;
    } else {
      return this.data[moduleName] = registration;
    }
  }
  /** @function registerPath(searchPath,basePath,dependency)
    * @param {string} searchPath - path to examine; default if none given
    * @param {string} basePath - base path for module path; defaults to current directory
    * @return {object}
    **/
  registerPath(searchPath = this.default.searchPath, basePath = Namespace.path, dependency = undefined) {
    return new Promise((resolve, reject) => {
      let promises = [];
      const relPath = path.relative('.', path.resolve(basePath, searchPath));
      fs.readdir(relPath, { 'encoding': 'utf8', 'withFiletypes': true }, (error, files) => {
        if(error) {
          reject(error);
        } else files.forEach(file => {
          if(fs.statSync(path.join(relPath, file)).isDirectory()) {
            promises.push(this.registerPath(path.join(searchPath, file), basePath, file));
          } else if(Namespace.default.includeExtensions.includes(path.extname(file))) {
            this.registerModule({name: path.basename(file, path.extname(file)), path: path.join(relPath, file), dependency: dependency});
          }
        });
        Promise.allSettled(promises)
          .then(() => {
            resolve(this.data);
          });
      });
    });
  }
}

let ns = new Namespace();

ns.register().then(() => {
  console.log(ns.data);
});
