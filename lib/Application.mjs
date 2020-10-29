/** @package        @cubo-cms/node-framework
  * @module         /lib/Application.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Core from './Core.mjs';
import FrameworkError from './FrameworkError.mjs';
import Log from './Log.mjs';
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
      let data = 'All ok';
      Log.info({ message: `Application processes new request`, source: this.name });
      Router.create({ method: request.method, path: request.url, payload: request.payload, contentType: request.headers['content-type'] }, this)
        .then((router) => {
          console.log(router);
          data = router;
          response = { status: 'success', statusCode: 200, message: 'OK', data: data };
          resolve(response);
        }).catch((error) => {
          if(typeof error === 'string') {
            reject({ status: 'error', statusCode: 500, message: error });
          } else {
            reject(error);
          }
/*        }).finally(() => {
          Log.debug({ message: `Application finished processing request`, source: this.name })
*/        });
    });
  }

  /** @function start(data)
    * Starts the server listening for requests
    * @param {string|object} data
    **/
  start(data = this.get('server')) {
    // Apply log settings
    Object.assign(Log.default, this.get('log'));
    // Actually start the server
    Server.create(data).then((server) => {
      server.listen(data.port, this.process.bind(this));
    });
  }
}
