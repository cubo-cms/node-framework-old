/** @package        @cubo-cms/node-framework
  * @module         /lib/FrameworkError.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

export default class FrameworkError extends Error {
  /** @constructor (error)
    * Class constructor
    * @param {any} error - thrown error
    **/
  constructor(error) {
    if(typeof error == 'string') {
      super(error);
    } else {
      super(error.message || 'Unknown error');
    }
  }
}
