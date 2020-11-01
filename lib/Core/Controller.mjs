/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Controller.mjs
  * @version        0.3.21
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Controller extends Namespace.Core {
  /** @property {object} method - holds controller methods
    **/
  method = {
    /** @method get()
      * Performs get method
      * @return {Promise <object>}
      **/
    get: function() {
      return new Promise((resolve, reject) => {
        // Limit access to documents according to user role
        let access = Namespace.Controller.access[this.session.get('userRole')];
        if(this.get('id') && !this.get('filter'))
          this.set('query', Object.assign({}, access.view));
        else
          this.set('query', Object.assign({}, access.list));
        // Invoke the model
        Namespace.Model.create(this.data, this)
          .then((model) => {
            // Invoke model method
            return model.invokeMethod();
          }).then((response) => {
            // Add session id to response
            response.sessionId = this.session.get('sessionId');
            // Resolve response
            resolve(response);
          }).catch((error) => {
            // Add session id to error
            error.sessionId = this.session.get('sessionId');
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
        if(Namespace[this.name].access.canCreate.includes(this.session.get('userRole'))) {
          if(this.get('payload').id) {
            // Invoke the model
            Namespace.Model.create(this.data, this)
              .then((model) => {
                // Invoke model method
                return model.invokeMethod();
              }).then((response) => {
                // Add session id to response
                response.sessionId = this.session.get('sessionId');
                // Resolve response
                resolve(response);
              }).catch((error) => {
                // Add session id to error
                error.sessionId = this.session.get('sessionId');
                // Reject with error
                reject(error);
              });
          } else {
            reject(Namespace.JResponse.respond('notAcceptable', { message: 'No id is specified' }));
          }
        } else {
          if(this.session.get('userRole') === 'guest') {
            reject(Namespace.JResponse.respond('forbidden', { message: 'User is not authenticated' }));
          } else {
            reject(Namespace.JResponse.respond('notAuthorized', { message: 'User is not authorized' }));
          }
        }
      });
    },
    /** @method put()
      * Performs put method
      * @return {Promise <object>}
      **/
/*    put: function() {
      return new Promise((resolve, reject) => {
        if(Namespace[this.name].access.canEdit.includes(this.session.get('userRole'))) {
          // Invoke the model
          Namespace.Model.create(this.data, this)
            .then((model) => {
              // Invoke model method
              return model.invokeMethod();
            }).then((response) => {
              // Add session id to response
              response.sessionId = this.session.get('sessionId');
              // Resolve response
              resolve(response);
            }).catch((error) => {
              // Add session id to error
              error.sessionId = this.session.get('sessionId');
              // Reject with error
              reject(error);
            });
        } else {
          if(this.session.get('userRole') === 'guest') {
            reject(Namespace.JResponse.respond('forbidden'));
          } else {
            reject(Namespace.JResponse.respond('notAuthorized'));
          }
        }
      });
    }, */
    /** @method skip()
      * Performs nothing
      * @return {Promise <object>}
      **/
    skip: function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResponse.respond('accepted'));
      });
    }
  };

  /** @static @property {object} access - limits access to documents
    **/
  static access = {
    guest: {
      view: { accessLevel: ['public','private','unauthenticated'], documentStatus: ['published'] },
      list: { accessLevel: ['public','unauthenticated'], documentStatus: ['published'] }
    },
    user: {
      view: { accessLevel: ['public','private','authenticated'], documentStatus: ['published'] },
      list: { accessLevel: ['public','authenticated'], documentStatus: ['published'] }
    },
    author: {
      view: { accessLevel: ['public','private','authenticated'], documentStatus: ['published','unpublished'] },
      list: { accessLevel: ['public','authenticated'], documentStatus: ['published','unpublished'] }
    },
    editor: {
      view: { accessLevel: ['public','private','authenticated'], documentStatus: ['published','unpublished'] },
      list: { accessLevel: ['public','authenticated'], documentStatus: ['published','unpublished'] }
    },
    publisher: {
      view: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] },
      list: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] }
    },
    manager: {
      view: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] },
      list: { accessLevel: ['public','private','authenticated','unauthenticated'], documentStatus: ['published','unpublished','archived','trashed'] }
    },
    administrator: {
      view: { accessLevel: ['public','private','authenticated','unauthenticated','system'], documentStatus: ['published','unpublished','archived','trashed'] },
      list: { accessLevel: ['public','private','authenticated','unauthenticated','system'], documentStatus: ['published','unpublished','archived','trashed'] }
    },
    canCreate: ['author','editor','publisher','manager','administrator']
  }

  /** @function application()
    * Getter to retrieve the application object
    * @return {object}
    **/
  get application() {
    return this.caller;
  }

  /** @function invokeMethod()
    * Invokes controller method and returns processed data
    * @return {Promise <object>}
    **/
  invokeMethod() {
    return new Promise((resolve, reject) => {
      let method = this.get('method');
      if(method) {
        if(typeof this.method[method] === 'function') {
          Namespace.Log.info({ message: `Controller invokes method \"${method}\"`, source: this.name });
          method = this.method[method].bind(this);
          resolve(method());
        } else {
          Namespace.Log.warning({ message: `Controller fails to invoke method \"${method}\"`, source: this.name });
          reject(Namespace.JResponse.respond('notAllowed'));
        }
      } else {
        Namespace.Log.warning({ message: `Controller cannot determine method`, source: this.name });
        reject(Namespace.JResponse.respond('notAllowed'));
      }
    });
  }

  /** @static @function create(data,caller)
    * Creates a new controller and keeps track of creating instance
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
    * Returns true if the specified controller exists in the namespace
    * @param {string} dataType
    * @return {boolean}
    **/
  static exists(dataType) {
    return Namespace.exists(dataType + this.name);
  }
}
