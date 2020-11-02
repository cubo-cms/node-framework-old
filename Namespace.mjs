/** @package        @cubo-cms/node-framework
  * @module         /Namespace.mjs
  * @version        0.3.22
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Log from './lib/Helper/Log.mjs';

class Namespace {
  /** @static @property {object} default - holds default settings for class
    **/
  static default = {
    useGlobal: false,       // option to publish namespace objects globally
    includeExtensions: ['.mjs', '.js'],
    searchPath: '#/lib'    // search path to locate modules
  };
  /** @static @private @property {object} data - holds registry of modules
    **/
  static #data = {};
  /** @static @private @property {object} failed - modules failed to load
    **/
  static #failed = [];
  /** @static @private @property {object} omitted - modules omitted to load
    **/
  static #omitted = [];
  /** @static @private @property {object} succeeded - modules loaded
    **/
  static #succeeded = [];

  /** @static @function basePath()
    * Getter to retriebe path to web root (removing node_modules)
    * @return {string}
    **/
  static get basePath() {
    return this.path.substring(0, this.path.indexOf(path.sep + 'node_modules') == -1 ? this.path.length : this.path.indexOf(path.sep + 'node_modules'));
  }
  /** @static @function path()
    * Getter to retrieve path to this module
    * @return {string}
    **/
  static get path() {
    return path.dirname(fileURLToPath(import.meta.url));
  }

  /** @static @function exists(moduleName)
    * Returns true if module exists
    * @param {string} moduleName - name of module
    * @return {boolean}
    **/
  static exists(moduleName) {
    return typeof this[moduleName] === 'function';
  }
  /** @static @function isRegistered(moduleName)
    * Returns true if module is registered
    * @param {string} moduleName - name of module
    * @return {boolean}
    **/
  static isRegistered(moduleName) {
    return typeof this.#data[moduleName] !== 'undefined';
  }
  /** @static @function load(registry)
    * Loads all registered modules
    * @param {object} data - optionally provide alternative registry
    * @return {object}
    **/
  static load(data = this.#data) {
    return new Promise((resolve, reject) => {
      let promises = [];
      for(const moduleName of Object.keys(data)) {
        if(this.#data[moduleName] && !this.#data[moduleName].done)
          promises.push(this.loadModule(moduleName));
      }
      Promise.allSettled(promises)
        .then(() => {
          Log.info({ message: `Namespace completed loading modules`, class: this.name, payload: this.#succeeded });
          if(Object.keys(this.#failed).length) {
            Log.warning({ message: `Namespace failed loading some modules`, source: this.name, payload: this.#failed });
          }
          this.#data = {};
          resolve(this);
        });
    });
    return this;
  }
  /** @static @function loadModule(moduleName)
    * Loads a module
    * @param {string} moduleName - name of module
    * @return {object}
    **/
  static loadModule(moduleName) {
    return new Promise((resolve, reject) => {
      let registry = this.#data[moduleName];
      if(registry) {
        if(registry.done) {
          resolve(moduleName);
        } else {
          registry.done = true;
          if(registry.dependency) {
            this.loadModule(registry.dependency)
              .then(() => {
                import(registry.path)
                  .then((module) => {
                    this[moduleName] = module.default;
                    if(this.default.useGlobal)
                      global[moduleName] = this[moduleName];
                    this.#succeeded.push(moduleName);
                    resolve(moduleName);
                  }).catch((error) => {
                    this.#failed.push(moduleName);
                    reject(error);
                  });
              });
          } else {
            import(registry.path)
              .then((module) => {
                this[moduleName] = module.default;
                if(this.default.useGlobal)
                  global[moduleName] = this[moduleName];
                this.#succeeded.push(moduleName);
                resolve(moduleName);
              }).catch((error) => {
                this.#failed.push(moduleName);
                reject(error);
              });
          }
        }
      } else {
        this.#omitted.push(moduleName);
        resolve(moduleName);
      }
    });
  }
  /** @static @function register(searchPath,basePath)
    * @param {string} searchPath - path to examine; default if none given
    * @param {string} basePath - base path for module path; defaults to current directory
    * @return {object}
    **/
  static register(searchPath = this.default.searchPath, basePath = this.basePath) {
    return new Promise((resolve, reject) => {
      this.registerPath(this.resolvePath(searchPath))
        .then((namespace) => {
          Log.info({ message: `Namespace completed registering modules`, source: this.name, payload: this.#data });
          resolve(this);
        }).catch((error) => {
          Log.error({ message: error, source: this.name });
          reject(error);
        });
    });
    return this;
  }
  /** @static @function registerModule(registration,moduleName)
    * function register - returns the registration of the module
    * @param {object} registration - object containing module registration info
    * @param {string} moduleName - (optional) name of module; allows override/alias
    * @return {object}
    **/
  static registerModule(registration, moduleName = registration.name) {
    if(typeof moduleName === 'undefined') {
      return undefined;
    } else {
      return this.#data[moduleName] = registration;
    }
  }
  /** @static @function registerPath(searchPath,dependency)
    * @param {string} searchPath - path to examine; default if none given
    * @return {object}
    **/
  static registerPath(searchPath, dependency = undefined) {
    return new Promise((resolve, reject) => {
      let promises = [];
      fs.readdir(searchPath, { 'encoding': 'utf8', 'withFiletypes': true }, (error, files) => {
        if(error) {
          reject(error);
        } else files.forEach(file => {
          if(fs.statSync(path.join(searchPath, file)).isDirectory()) {
            promises.push(this.registerPath(path.join(searchPath, file), file));
          } else if(this.default.includeExtensions.includes(path.extname(file))) {
            this.registerModule({name: path.basename(file, path.extname(file)), path: 'file://' + path.join(searchPath, file), dependency: dependency});
          }
        });
        Promise.allSettled(promises)
          .then(() => {
            resolve(this.#data);
          });
      });
    });
  }

  /** @static @function resolvePath(data)
    * Returns a resolved path
    * @param {string} data
    * @return {string}
    **/
  static resolvePath(data) {
    return data.startsWith('#/') ? path.resolve(this.basePath, data.substr(2)) : path.resolve(this.path, data);
  }
}

await Namespace.register();

export default Namespace;
