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
        resolve(Namespace.JResponse.success({ contentType: 'text/html; charset=utf-8', data: '<pre>' + JSON.stringify(this.get('data'), null, 2) + '</pre>', sessionId: this.get('sessionId') }));
      });
    },
    /** @method json()
      * Performs json render
      * @return {Promise <object>}
      **/
    json: function() {
      return new Promise((resolve, reject) => {
        this.set('contentType', 'application/json; charset=utf-8');
        resolve(this.data);
      });
    },
    /** @method json-pretty()
      * Performs json-pretty render
      * @return {Promise <object>}
      **/
    'json-pretty': function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResponse.success({ contentType: 'application/json; charset=utf-8', data: JSON.stringify(this.get('data'), null, 2), sessionId: this.get('sessionId') }));
      });
    },
    /** @method json-response()
      * Performs json-response render
      * @return {Promise <object>}
      **/
    'json-response': function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResponse.success({ contentType: 'application/json; charset=utf-8', data: JSON.stringify(this.data, null, 2), sessionId: this.get('sessionId') }));
      });
    }
  };

  /** @property {object} default - holds default values
    **/
  default = {
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
