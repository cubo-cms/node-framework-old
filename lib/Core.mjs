/** @package        @cubo-cms/node-framework
  * @module         /lib/Core.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import https from 'https';

export default class Core {
  /** @property {object} data - holds data specific for this instance
    **/
  data = {};
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {};
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
    this.data = data;
    this.#name = this.__proto__.constructor.name;
    this.#caller = undefined;
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
  /** @function apply(data)
    * Applies defaults to the instance
    * @param {object} data - instance defaults get merged
    * @return {object}
    **/
  apply(data) {
    return Object.assign(this.default, data);
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
  /** @async @function load(data)
    * Loads data and stores it for this instance
    * @param {string|object} data
    * @return {object}
    **/
  async load(data = {}) {
    if(typeof data === 'string') {
      return this.data = await Core.load(data) || {};
    } else if(typeof data === 'object') {
      return this.data = data;
    }
  }
  /** @async @function merge(data)
    * Loads data and merges it with existing data for this instance
    * @param {string|object} data
    * @return {object}
    **/
  async merge(data = {}) {
    if(typeof data === 'string') {
      return Object.assign(this.data, await Core.load(data) || {});
    } else if(typeof data === 'object') {
      return Object.assign(this.data, data);
    }
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
    * @return {object}
    **/
  static create(data = {}, caller = undefined) {
    const instance = new this(data);
    instance.caller = caller;
    return instance;
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
    * @param {object} data
    * @return {object}
    **/
  static async load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        if(this.isURL(data)) {
          https.get(data, (response) => {
            payload = '';
            response.on('data', (chunk) => {
              payload += chunk;
            }).on('end', () => {
              resolve(JSON.parse(payload));
            });
          }).on('error', (error) => reject(error));
        } else {
          fs.readFile(data, 'utf8', (error, data) => {
            if(error) reject(error);
            resolve(JSON.parse(data));
          });
        }
      } else if(typeof data === 'object') {
        resolve(data);
      }
    });
  }
}
