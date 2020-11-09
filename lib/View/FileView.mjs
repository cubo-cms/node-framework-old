/** @package        @cubo-cms/node-framework
  * @module         /lib/View/FileView.mjs
  * @version        0.3.23
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class FileView extends Namespace.View {
  /** @property {object} render - holds view methods
    **/
  render = {
    /** @method image()
      * Performs html render
      * @return {Promise <object>}
      **/
    image: function() {
      return new Promise((resolve, reject) => {
        resolve(Namespace.JResponse.success('OK'));
      });
    }
  }
}
