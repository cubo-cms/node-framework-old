/** @package        @cubo-cms/node-framework
  * @module         /lib/Application.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Core from './Core.mjs';
import Log from './Log.mjs';
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
  constructor(data = 'application.json') {
    super(data);
  }

  /** @function start(serverOptions)
    * Starts the server listening for requests
    * @param {string|object} data
    **/
  start(data = this.get('server')) {
    let server = new Server(data);
    server.loaded((server) => {
      server.listen();
    });
  }
}
