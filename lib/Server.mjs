/** @package        @cubo-cms/node-framework
  * @module         /lib/Server.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Core from './Core.mjs';
import Log from './Log.mjs';

export default class Server extends Core {
  /** @property {object} default - holds defaults specific for this instance
    **/
  default = {
    port: 8000
  };

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    Log.success(`Server is initiated`);
  }

  /** @function list(port)
    * Starts listening on specified port
    * @param {int} port
    **/
  listen(port = undefined) {
    this.set('port', port, this.get('port'));
    Log.success(`Server starts listening on port ${this.get('port')}`);
  }
}
