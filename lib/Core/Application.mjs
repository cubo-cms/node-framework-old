/** @package        @cubo-cms/node-framework
  * @module         /lib/Application.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Controller from './Controller.mjs';
import Cookie from '../Helper/Cookie.mjs';
import Core from '../Core.mjs';
import FrameworkError from '../FrameworkError.mjs';
import Log from '../Helper/Log.mjs';
import Router from './Router.mjs';
import Server from './Server.mjs';
import Session from './Session.mjs';

export default class Application extends Core {
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

  /** @async @function process(request)
    * Processes the request
    **/
  async process(request) {
    return new Promise((resolve, reject) => {
      let response = {};
      Log.info({ message: `Application processes new request`, source: this.name });
      Router.create(this.get('router'), this)
        .then((router) => {
          // Parse request
          let response = router.parse({ method: request.method, path: request.url, payload: request.payload, contentType: request.headers['content-type'] });
          // Create or retrieve session
          let session;
          let cookie = Cookie.unserialize(request.headers['cookie']);
          cookie.sessionId = cookie.sessionId || Session.generateKey();
          if(response.accessToken) {
            session = Session.find(response.accessToken);
            if(cookie.sessionId != session.sessionId)
              session = undefined;
          }
          if(session === undefined) {
            if(session = Session.get(cookie.sessionId))
              session.setLifetime();
            else
              session = new Session(cookie);
          }
          // Call controller
          if(response.status === 'success') {
            Controller.create(response.data, this)
              .then((controller) => {
                console.log('Controller!');
              });
          }
          // Return back cookie
          response.cookie = [ Cookie.serialize({ sessionId: response.sessionId || cookie.sessionId, Path: '/', Secure: true }) ];
          resolve(response);
        }).catch((error) => {
          if(typeof error === 'string') {
            reject({ status: 'error', statusCode: 500, message: error });
          } else {
            reject(error);
          }
        });
    });
  }

  /** @function start(data)
    * Starts the server listening for requests
    * @param {string|object} data
    **/
  start(data = this.get('server')) {
    // Apply log settings
    Object.assign(Log.default, this.get('log'));
    Log.info({ message: `Application starts`, source: this.name });
    // Actually start the server
    Server.create(data, this).then((server) => {
      server.listen(data.port, this.process.bind(this));
    });
  }
}
