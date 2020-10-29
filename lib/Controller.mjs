/** @package        @cubo-cms/node-framework
  * @module         /lib/Controller.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Core from './Core.mjs';
import Log from './Log.mjs';

export default class Controller extends Core {
  /** @static @property {object} default - holds default settings for class
    **/
  static default = {
  };

  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
  }

  /** @function application()
    * Getter to retrieve the application object
    * @return {object}
    **/
  get application() {
    return this.caller;
  }
}
