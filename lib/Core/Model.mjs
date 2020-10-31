/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Model.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Model extends Namespace.Core {
  /** @property {object} default - holds default values
    **/
  static default = {
    driver: 'JSON',
    documentStatus: 'published',
    page: 1,
    pageSize: 100,
    show: ['id', 'name', 'description', 'body', 'metadata'],
    hide: ['_id','password'],
    sort: ['name', 'up']
  }
  /** @property {object} method - holds controller methods
    **/
  method = {
  };

  /** @function controller()
    * Getter to retrieve the controller object
    * @return {object}
    **/
  get controller() {
    return this.caller;
  }

  /** @function invokeMethod()
    * Invokes model method and returns processed data
    * @return {Promise <object>}
    **/
  invokeMethod() {
    return new Promise((resolve, reject) => {
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          Namespace.Log.info({ message: `Model invokes method \"${method}\"`, source: this.name });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          Namespace.Log.warning({ message: `Model fails to invoke method \"${method}\"`, source: this.name });
          reject(Namespace.JResponse.respond('notAllowed'));
        }
      } else {
        Namespace.Log.warning({ message: `Model cannot determine method`, source: this.name });
        reject(Namespace.JResponse.respond('notAllowed'));
      }
    });
  }

  /** @static @function create(data,caller)
    * Creates a new model and keeps track of creating instance
    * @param {object} data
    * @param {object} caller
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined) {
    return new Promise((resolve, reject) => {
      let instance;
      if(this.exists(data.dataType)) {
        instance = new Namespace[data.dataType + this.name](data);
      } else {
        instance = new this(data);
      }
      if(caller)
        Namespace.Log.info({ message: `${caller.name} creates ${instance.name} instance`, source: instance.name, payload: data });
      instance.caller = caller;
      instance.success(() => { resolve(instance); });
    });
  }
  /** @static @function exists(dataType)
    * Returns true if the specified model exists in the namespace
    * @param {string} dataType
    * @return {boolean}
    **/
  static exists(dataType) {
    return Namespace.exists(dataType + this.name);
  }
}
