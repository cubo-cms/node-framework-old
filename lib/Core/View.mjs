/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/View.mjs
  * @version        0.3.21
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class View extends Namespace.Core {
  /** @property {object} render - holds view methods
    **/
  render = {
    /** @method html()
      * Performs html render
      * @return {Promise <object>}
      **/
    html: function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResolve.success({ contentType: 'text/html; charset=utf-8', render: 'html', data: '<pre>' + JSON.stringify(this.data, null, '\t') + '</pre>' }));
      });
    },
    /** @method json()
      * Performs json render
      * @return {Promise <object>}
      **/
    json: function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResolve.success({ contentType: 'application/json; charset=utf-8', render: 'json', data: this.data }));
      });
    },
    /** @method json-pretty()
      * Performs json-pretty render
      * @return {Promise <object>}
      **/
    'json-pretty': function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResolve.success({ contentType: 'application/json; charset=utf-8', render: 'json-pretty', data: JSON.stringify(this.data, null, '\t') }));
      });
    }
  };

  /** @static @property {object} default - holds default values
    **/
  static default = {
    render: 'html'
  }

  /** @function controller()
    * Getter to retrieve the controller object
    * @return {object}
    **/
  get controller() {
    return this.caller;
  }

  /** @function invokeRender()
    * Invokes view render and returns processed data
    * @return {Promise <object>}
    **/
  invokeRender() {
    console.log(this);
    return new Promise((resolve, reject) => {
      let render = this.get('render');
      if(render) {
        if(typeof this.render[render] === 'function') {
          Namespace.Log.info({ message: `View invokes render \"${render}\"`, source: this.name });
          render = this.render[render].bind(this);
          resolve(render());
        } else {
          Namespace.Log.warning({ message: `View fails to invoke render \"${render}\"`, source: this.name });
          reject(Namespace.JResponse.respond('notAllowed'));
        }
      } else {
        Namespace.Log.warning({ message: `View cannot determine render`, source: this.name });
        reject(Namespace.JResponse.respond('notAllowed'));
      }
    });
  }

  /** @static @function create(data,caller)
    * Creates a new view and keeps track of creating instance
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
      instance.success(() => {
        resolve(instance);
      });
    });
  }
  /** @static @function exists(dataType)
    * Returns true if the specified view exists in the namespace
    * @param {string} dataType
    * @return {boolean}
    **/
  static exists(dataType) {
    return Namespace.exists(dataType + this.name);
  }
}
