/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Model.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Model extends Namespace.Core {
  /** @property {object} method - holds model methods
    **/
  method = {
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Invoke the driver
        Namespace.Driver.create(this.prepareData(), this)
          .then((driver) => {
            // Invoke driver method
            return driver.invokeMethod();
          }).then((response) => {
            Namespace.Log.info({ message: `Model returns success`, source: this.name, payload: response });
            // Resolve response
            resolve(response);
          }).catch((error) => {
            Namespace.Log.info({ message: `Model returns failure`, source: this.name, payload: error });
            // Reject with error
            reject(error);
          });
      });
    },
    /** @method post()
      * Performs post method
      * @return {Promise <object>}
      **/
    post: function() {
      return new Promise((resolve, reject) => {
        if(this.get('readOnly')) {
          reject(Namespace.JResponse.respond('notAllowed', { message: 'Data type is read-only', header: { Allow: 'GET' } }));
        } else {
          // Invoke the driver
          Namespace.Driver.create(this.prepareData(), this)
            .then((driver) => {
              // Invoke driver method
              return driver.invokeMethod();
            }).then((response) => {
              Namespace.Log.info({ message: `Model returns success`, source: this.name, payload: response });
              // Resolve response
              resolve(response);
            }).catch((error) => {
              Namespace.Log.info({ message: `Model returns failure`, source: this.name, payload: error });
              // Reject with error
              reject(error);
            });
        }
      });
    },
    /** @method put()
      * Performs put method
      * @return {Promise <object>}
      **/
    put: function() {
      return new Promise((resolve, reject) => {
        if(this.get('readOnly')) {
          reject(Namespace.JResponse.respond('notAllowed', { message: 'Data type is read-only', header: { Allow: 'GET' } }));
        } else {
          // Invoke the driver
          Namespace.Driver.create(this.prepareData(), this)
            .then((driver) => {
              // Invoke driver method
              return driver.invokeMethod();
            }).then((response) => {
              Namespace.Log.info({ message: `Model returns success`, source: this.name, payload: response });
              // Resolve response
              resolve(response);
            }).catch((error) => {
              Namespace.Log.info({ message: `Model returns failure`, source: this.name, payload: error });
              // Reject with error
              reject(error);
            });
        }
      });
    }
  };

  /** @static @property {object} default - holds default values
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
  /** @function prepareData()
    * Prepares data to pass on to driver
    * @return {object}
    **/
  prepareData() {
    let data = this.data;
    let query = this.get('query') || {};
    // Apply filter
    if(this.has('filter') && this.has('id')) {
      if(query[this.get('filter')]) {
        if(query[this.get('filter')].includes(this.get('id')))
          query[this.get('filter')] = [this.get('id')];
        else
          query[this.get('filter')] = [];
      } else {
        query[this.get('filter')] = [this.get('id')];
      }
      delete data['id'];
    }
    if(this.has('id'))
      query['id'] = [this.get('id')];
    // Fill in defaults, if not requested specifically
    data['driver'] = this.get('driver');
    data['page'] = Namespace.Model.parseInt(this.get('page'));
    data['pageSize'] = Namespace.Model.parseInt(this.get('pageSize'));
    data['show'] = Namespace.Model.parseArray(this.get('show'));
    data['hide'] = Namespace.Model.parseArray(this.get('hide'));
    data['sort'] = Namespace.Model.parseArray(this.get('sort'));
    // Pass all these on when constructing driver
    data['query'] = query;
    return data;
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
        // Get static default and load as object default
        instance.default = Namespace[data.dataType + this.name].default;
      } else {
        instance = new this(data);
        // Get static default and load as object default
        instance.default = this.default;
      }
      if(caller)
        Namespace.Log.info({ message: `${caller.name} creates ${instance.name} instance`, source: instance.name, payload: data });
      instance.caller = caller;
      instance.success(() => {
        // Get source data and move it into object data
        Object.assign(instance.data, caller.source);
        if(instance.data.model)
          Object.assign(instance.default, instance.data.model);
        resolve(instance);
      });
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
  /** @static @function parseArray(data)
    * Returns array of properties or values
    * @param {string||array} data
    * @return {array}
    **/
  static parseArray(data) {
    if(!Array.isArray(data))
      if(data)
        return Array.from(data.matchAll(/([\w\-_]+)/g), m =>m[0]);
      else
        return undefined;
    else
      return data;
  }
  /** @static @function parseBool(data)
    * Returns true or false from value
    * @param {string||int||bool} data
    * @return {bool}
    **/
  static parseBool(data) {
    return data === 'true' || data;
  }
  /** @static @function parseInt(data)
    * Returns integer value
    * @param {string} data
    * @return {int}
    **/
  static parseInt(data) {
    if(data)
      return parseInt(data, 10);
    else
      return undefined;
  }
  /** @static @function parseString(data)
    * Returns string of property or value
    * @param {string} data
    * @return {string}
    **/
  static parseString(data) {
    if(typeof data === 'string')
      return data.match(/([\w\-_]+)/g)[0];
    else
      return undefined;
  }
}
