/** @package        @cubo-cms/node-framework
  * @module         /lib/Core.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

import FrameworkError from './FrameworkError.mjs';
import FrameworkEvent from './FrameworkEvent.mjs';
import Log from './Helper/Log.mjs';

export default class Core {
  /** @property {object} data - holds data specific for this instance
    **/
  data = {};
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {};
  /** @property {object} event - event emitter
    **/
  event;
  /** @private @property {object} caller - determines the object that created this instance
    **/
  #caller;
  /** @private @property {string} name - returns the name of this instance class
    **/
  #name = constructor.prototype.name;

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    this.#caller = undefined;
    this.event = new FrameworkEvent(this);
    this.#name = this.__proto__.constructor.name;
    Core.load(data)
      .then((data) => {
        this.data = Object.assign({}, data);
      }).catch((error) => {
        new FrameworkError(error);
      }).finally(() => {
        this.event.emit('success', this);
      });
  }

  /** @function caller()
    * Getter to retrieve the object that created this instance
    * @return {object}
    **/
  get caller() {
    return this.#caller;
  }
  /** @function name()
    * Getter to retrieve the name of this instance class
    * @return {string}
    **/
  get name() {
    return this.#name;
  }
  /** @function caller(caller)
    * Setter to track the object that created this instance
    * @return {object}
    **/
  set caller(caller) {
    this.#caller = caller;
  }
  /** @static @function basePath()
    * Getter to retriebe path to web root (removing node_modules)
    * @return {string}
    **/
  static get basePath() {
    return this.path.substring(0, this.path.indexOf(path.sep + 'node_modules') == -1 ? this.path.lastIndexOf(path.sep) : this.path.indexOf(path.sep + 'node_modules'));
  }
  /** @static @function path()
    * Getter to retrieve path to this module
    * @return {string}
    **/
  static get path() {
    return path.dirname(fileURLToPath(import.meta.url));
  }

  /** @function apply(data,trigger)
    * Applies defaults to the instance
    * @param {string|object} data - instance defaults get merged
    * @param {string} trigger
    **/
  apply(data, trigger = 'success') {
    Core.load(data)
      .then((data) => {
        Object.assign(this.default, data);
      }).catch((error) => {
        new FrameworkError(error);
      }).finally(() => {
        this.event.emit(trigger, this);
      });
    return this;
  }
  /** @function error(eventHandler)
    * Sets a trigger on error event
    * @param {function} eventHandler
    **/
  error(eventHandler) {
    this.on('error', eventHandler);
    return this;
  }
  /** @function get(property,defaultValue)
    * Retrieves the property value
    * @param {string} property
    * @param {any} defaultValue
    * @return {any}
    **/
  get(property, defaultValue = this.default[property]) {
    return this.data[property] || defaultValue;
  }
  /** @function has(property)
    * Returns true if the property exists
    * @param {string} property
    * @return {boolean}
    **/
  has(property) {
    return this.data[property] !== undefined;
  }
  /** @function load(data,trigger)
    * Loads data and stores it for this instance
    * @param {string|object} data
    * @param {string} trigger
    **/
  load(data = {}, trigger = 'success') {
    Core.load(data)
      .then((data) => {
        this.data = Object.assign({}, data);
      }).catch((error) => {
        new FrameworkError(error);
      }).finally(() => {
        this.event.emit(trigger, this);
      });
    return this;
  }
  /** @function loadFile(target,data,trigger)
    * Loads data and returns it as a string
    * @param {string} target - where to write data to
    * @param {string|object} data
    * @param {string} trigger
    **/
  loadFile(target = 'file', data = {}, trigger = 'success') {
    Core.loadFile(data)
      .then((data) => {
        this.data[target] = data;
      }).catch((error) => {
        new FrameworkError(error);
      }).finally(() => {
        this.event.emit(trigger, this);
      });
    return this;
  }
  /** @function merge(data,trigger)
    * Loads data and merges it with existing data for this instance
    * @param {string|object} data
    * @param {string} trigger
    **/
  merge(data = {}, trigger = 'success') {
    Core.load(data)
      .then((data) => {
        Object.assign(this.data, data);
      }).catch((error) => {
        new FrameworkError(error);
      }).finally(() => {
        this.event.emit(trigger, this);
      });
    return this;
  }
  /** @function on(trigger,eventHandler)
    * Sets a trigger on an event
    * @param {string} trigger
    * @param {function} eventHandler
    **/
  on(trigger, eventHandler) {
    this.event.on(trigger, eventHandler.bind(this));
    return this;
  }
  /** @function once(trigger,eventHandler)
    * Sets a once-only trigger on an event
    * @param {string} trigger
    * @param {function} eventHandler
    **/
  once(trigger, eventHandler) {
    this.event.once(trigger, eventHandler.bind(this));
    return this;
  }
  /** @function set(property,value,defaultValue)
    * Stores a value for a property
    * @param {string} property
    * @param {any} value
    * @param {any} defaultValue
    * @return {any}
    **/
  set(property, value, defaultValue = this.default[property]) {
    return this.data[property] = value || defaultValue;
  }
  /** @function success(eventHandler)
    * Sets a trigger on success event
    * @param {function} eventHandler
    * @return {object}
    **/
  success(eventHandler) {
    this.once('success', eventHandler);
    return this;
  }
  /** @function toJSON()
    * Prepares instance for JSON
    * @return {object}
    **/
  toJSON() {
    return this.data;
  }
  /** @function toString()
    * Returns the name of the instance
    * @return {string}
    **/
  toString() {
    return this.name;
  }
  /** @function valueOf()
    * Returns instance data
    * @return {object}
    **/
  valueOf() {
    return this.data;
  }

  /** @static @function apply(data)
    * Applies defaults to the class
    * @param {object} data - class defaults get merged
    * @return {object}
    **/
  static apply(data) {
    return Object.assign(this.default, data);
  }
  /** @static @function create(data,caller)
    * Creates a new instance and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance = new this(data);
      if(caller)
        Log.info({ message: `${caller.name} creates ${instance.name} instance`, source: instance.name, payload: data });
      instance.caller = caller;
      instance.success(() => { resolve(instance); });
    });
  }
  /** @static @function isPath(data)
    * Returns true if data is a file path
    * @param {string} data
    * @return {boolean}
    **/
  static isPath(data) {
    const URLtester = /^(#\/|\/|\.\/|\.\.\/|[A-Z]:\\|\\\\)/g;
    return URLtester.test(data);
  }
  /** @static @function isURL(data)
    * Returns true if data is a URL
    * @param {string} data
    * @return {boolean}
    **/
  static isURL(data) {
    const URLtester = /^[\w\-\+_]+:.+/g;
    return URLtester.test(data);
  }
  /** @static @async @function load(data)
    * Loads data and and returns it as an object
    * @param {string|object} data
    * @return {object}
    **/
  static async load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        if(this.isURL(data)) {
          const scheme = data.startsWith('http://') ? http : https;
          scheme.get(data, (response) => {
            let payload = '';
            response.on('data', (chunk) => {
              payload += chunk;
            }).on('end', () => {
              resolve(JSON.parse(payload));
            }).on('error', (error) => {
              reject(error);
            });
          }).on('error', (error) => reject(error));
        } else if(this.isPath(data)) {
          let filePath = this.resolvePath(data);
          fs.readFile(filePath, 'utf8', (error, data) => {
            if(error) {
              reject(error);
            } else {
              resolve(JSON.parse(data));
            }
          });
        } else {
          resolve(JSON.parse('\"' + data + '\"'));
        }
      } else if(typeof data === 'object') {
        resolve(data);
      }
    });
  }
  /** @static @async @function loadFile(data)
    * Loads data and and returns it as a string
    * @param {string|object} data
    * @return {string}
    **/
  static async loadFile(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        if(this.isURL(data)) {
          const scheme = data.startsWith('http://') ? http : https;
          scheme.get(data, (response) => {
            let payload = '';
            response.on('data', (chunk) => {
              payload += chunk;
            }).on('end', () => {
              resolve(payload);
            }).on('error', (error) => {
              reject(error);
            });
          }).on('error', (error) => reject(error));
        } else if(this.isPath(data)) {
          let filePath = this.resolvePath(data);
          fs.readFile(filePath, 'utf8', (error, data) => {
            if(error) {
              reject(error);
            } else {
              resolve(data);
            }
          });
        } else {
          resolve(data);
        }
      } else if(typeof data === 'object') {
        resolve(JSON.stringify(data));
      }
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
