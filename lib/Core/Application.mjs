/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Application.mjs
  * @version        0.3.22
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Application extends Namespace.Core {
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {
  };

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = '#/application.json') {
    super(data);
  }

  /** @function getSession(accessToken)
    * Creates or retrieves session from optional accessToken
    * @param {string} accessToken
    * @param {object} cookie
    * @param {object} - session object
    **/
  getSession(accessToken, cookie) {
    let session;
    if(accessToken) {
      if(session = Namespace.Session.find(accessToken))
        session.setLifetime();
    }
    if(session === undefined) {
      if(session = Namespace.Session.get(cookie.sessionId))
        session.setLifetime();
      else
        session = new Namespace.Session(cookie);
    }
    return session;
  }
  /** @function loadSource(dataSource,controller)
    * Determines the data source for this controller
    * @param {string|object} dataSource
    * @param {object} controller
    * @param {Promise <object>} - controller object
    **/
  loadSource(dataSource, controller) {
    return new Promise((resolve, reject) => {
      Namespace.Core.load(dataSource)
        .then((dataSource) => {
          if(dataSource[controller.get('dataType')]) {
            controller.source = dataSource[controller.get('dataType')];
            resolve(controller);
          } else {
            reject(Namespace.JResponse.respond('notAcceptable'));
          }
        }).catch((error) => {
          reject(Namespace.JResponse.error(error));
        });
    });
  }
  /** @function loadStyle(style,controller)
    * Determines the data source for this controller
    * @param {string|object} style
    * @param {object} controller
    * @param {Promise <object>} - controller object
    **/
  loadStyle(style, controller) {
    return new Promise((resolve, reject) => {
      Namespace.Core.load(style)
        .then((style) => {
          if(style[controller.get('dataType')]) {
            controller.style = style[controller.get('dataType')];
            resolve(controller);
          } else {
            controller.style = style['default'];
            resolve(controller);
          }
        }).catch((error) => {
          reject(Namespace.JResponse.error(error));
        });
    });
  }
  /** @function process(request)
    * Processes the request
    * @param {object} request
    * @return {Promise <object>}
    **/
  process(request) {
    return new Promise((resolve, reject) => {
      let cookie;
      let response = {};
      let session;
      let requestStarted = Date.now();
      Namespace.Log.info({ message: `Application processes new request`, source: this.name });
      Namespace.Router.create(this.get('router'), this)
        .then((router) => {
          // Retrieve cookies
          cookie = Namespace.Cookie.unserialize(request.headers['cookie']);
          cookie.sessionId = cookie.sessionId || Namespace.Session.generateKey();
          // Parse request
          return router.parse({ method: request.method, path: request.url, payload: request.payload, contentType: request.headers['content-type'] });
        }).then((response) => {
          // Create or retrieve session
          session = this.getSession(response.data.accessToken, cookie);
          // Call controller
          return Namespace.Controller.create(response.data, this);
        }).then((controller) => {
          // Pass datasource to controller
          return this.loadSource(this.get('dataSource'), controller);
        }).then((controller) => {
          // Pass style to controller
          return this.loadStyle(this.get('style'), controller);
        }).then((controller) => {
          // Pass session object to controller
          controller.session = session;
          // Pass request start time to controller
          controller.requestStarted = requestStarted;
          // Invoke controller method
          return controller.invokeMethod();
        }).then((response) => {
          // Add response cookie
          response.cookie = [ Namespace.Cookie.serialize({ sessionId: response.sessionId || cookie.sessionId, Path: '/', Secure: true }) ];
          // Resolve response
          resolve(response);
        }).catch((error) => {
          // Reject with error
          reject(error);
        });
    });
  }

  /** @function start(data)
    * Starts the server listening for requests
    * @param {string|object} data
    **/
  start(data = this.get('server')) {
    // Apply log settings
    Object.assign(Namespace.Log.default, this.get('log'));
    Namespace.Log.info({ message: `Application starts`, source: this.name });
    // Actually start the server
    Namespace.Server.create(data, this)
      .then((server) => {
        server.listen(data.port, this.process.bind(this));
      }).catch((error) => {
        console.log('Error when creating server?');
        console.log(error);
      });
  }
}
