/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/View.mjs
  * @version        0.3.23
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import marked from 'marked';
import Parser from 'parserblade';
const { xml, yaml } = Parser;

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
        let style = this.get('style')  || Array.isArray(this.get('data')) ? 'list' : 'document';
        if(style && this.style[style]) {
          Namespace.Core.loadFile(this.style[style])
            .then((template) => {
              return Namespace.HTMLRenderer.create(this.data, this)
                .then((renderer) => {
                  return renderer.render(template);
                }).then((content) => {
                  this.set('content', content);
                  console.log(this);
                  return Namespace.Template.create(this.data, this);
                }).then((template) => {
                  return template.invokeRender();
                }).then((data) => {
                  this.set('requestResolved', Date.now());
                  this.set('requestTime', (this.data.requestResolved - this.data.requestStarted) / 1000);
                  this.set('contentType', 'text/html; charset=utf-8');
                  this.set('data', data);
                  resolve(this.data);
                }).catch((error) => {
                  reject(Namespace.JResponse.respond('badRequest', { message: 'View cannot render template' }));
                });
            }).catch((error) => {
              reject(Namespace.JResponse.respond('badRequest', { message: 'View cannot load template' }));
            });
        } else {
          reject(Namespace.JResponse.respond('badRequest', { message: 'View cannot load component' }));
        }
      });
    },
    /** @method xml()
      * Performs xml render
      * @return {Promise <object>}
      **/
    xml: function() {
      return new Promise((resolve, reject) => {
        this.set('requestResolved', Date.now());
        this.set('requestTime', (this.data.requestResolved - this.data.requestStarted) / 1000);
        this.set('contentType', 'application/xml; charset=utf-8');
        let data = {};
        if(Array.isArray(this.data.data)) {
          data['Array'] = {};
          data.Array[this.get('dataType')] = this.data.data;
          this.set('data', xml.stringify(data));
        } else {
          data[this.get('dataType')] = this.data.data;
          this.set('data', xml.stringify(data));
        }
        resolve(this.data);
      });
    },
    /** @method yaml()
      * Performs yaml render
      * @return {Promise <object>}
      **/
    yaml: function() {
      return new Promise((resolve, reject) => {
        this.set('requestResolved', Date.now());
        this.set('requestTime', (this.data.requestResolved - this.data.requestStarted) / 1000);
        this.set('contentType', 'text/x-yaml; charset=utf-8');
        let data = {};
        data[this.get('dataType')] = this.data.data;
        this.set('data', yaml.stringify(data));
        resolve(this.data);
      });
    },
    /** @method json()
      * Performs json render
      * @return {Promise <object>}
      **/
    json: function() {
      return new Promise((resolve, reject) => {
        this.set('requestResolved', Date.now());
        this.set('requestTime', (this.data.requestResolved - this.data.requestStarted) / 1000);
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
        this.set('requestResolved', Date.now());
        this.set('requestTime', (this.data.requestResolved - this.data.requestStarted) / 1000);
        resolve(Namespace.JResponse.success({ contentType: 'application/json; charset=utf-8', data: JSON.stringify(this.get('data'), null, 2), sessionId: this.get('sessionId') }));
      });
    },
    /** @method json-response()
      * Performs json-response render
      * @return {Promise <object>}
      **/
    'json-response': function() {
      return new Promise((resolve, reject) => {
        this.set('requestResolved', Date.now());
        this.set('requestTime', (this.data.requestResolved - this.data.requestStarted) / 1000);
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
          if(this.data.data && this.data.data.text && (Namespace.Core.isPath(this.data.data.text) || Namespace.Core.isURL(this.data.data.text))) {
            Namespace.Core.loadFile(this.data.data.text)
              .then((text) => {
                this.data.data.text = marked(text);
                render = this.render[render].bind(this);
                resolve(render());
              }).catch((error) => {
                reject(error);
              })
          } else {
            render = this.render[render].bind(this);
            resolve(render());
          }
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
