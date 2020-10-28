/** @package        @cubo-cms/node-framework
  * @module         /lib/FrameworkEvent.mjs
  * @version        0.3.20
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import { EventEmitter } from 'events';

import Core from './Core.mjs';

export default class FrameworkEvent extends EventEmitter {
  /** @constructor (error)
    * Class constructor
    * @param {any} error - thrown error
    **/
  constructor(object) {
    super();
    this.object = object;
  }

  loaded(object) {
    console.log('Object finished loading');
    console.log(object.data);
  }
}
