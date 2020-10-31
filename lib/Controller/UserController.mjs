/** @package        @cubo-cms/node-framework
  * @module         /lib/Controller/UserController.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Controller from '../Core/Controller.mjs';
import Core from '../Core.mjs';

export default class UserController extends Controller {
  /** @constructor (data)
    * Class constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    super(data);
    console.log('Hi, this is the User Controller');
  }
}
