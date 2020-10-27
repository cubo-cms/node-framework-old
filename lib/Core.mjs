/** @package        @cubo-cms/node-framework
  * @module         /lib/Core.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

export default class Core {
  data = {};
  default = {};
  #caller;
  #name = constructor.prototype.name;
  constructor(data = {}) {
    this.data = data;
    this.#name = this.__proto__.constructor.name;
    this.#caller = undefined;
  }
  get caller() {
    return this.#caller;
  }
  get caller() {
    return this.#name;
  }
  set caller(caller) {
    this.#caller = caller;
  }
  get(property, defaultValue = this.default[property]) {
    return this.data[property] || defaultValue;
  }
  has(property) {
    return this.data[property] !== undefined;
  }
  async load(data = {}) {
    if(typeof data === 'string') {

    } else if(typeof data === 'object') {
      this.data = data;
    }
  }
  async merge(data = {}) {
    if(typeof data === 'string') {

    } else if(typeof data === 'object') {
      this.data = data;
    }
  }
  set(property, value, defaultValue = this.default[property]) {
    return this.data[property] = value || defaultValue;
  }
  static create(data = {}, caller = undefined) {
    const instance = new this(data);
    instance.caller = caller;
    return instance;
  }
  static async load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        resolve({});
      } else if(typeof data === 'object') {
        resolve(data);
      }
    });
  }
}
