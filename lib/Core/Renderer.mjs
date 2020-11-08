/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Renderer.mjs
  * @version        0.3.23
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

String.prototype.replaceAll = function(regExp, routine) {
  let result = this;
  for(const match of [...result.matchAll(regExp)]) {
    result = result.split(match[0]).join(routine(match[0], match.slice(1)));
  }
  return result;
}

export default class Renderer extends Namespace.Core {
  /** @property {object} format - holds routines to format tag values
    **/
  format = {};
  /** @property {object} rule - holds rules to render tags
    **/
  rule = {};
  /** @function render(text)
    *
    * Function render - renders tags in text
    *
    * @param {string} text
    * @return {string}
    **/

  render(text) {
    return new Promise((resolve, reject) => {
      for(const rule of Object.values(this.rule)) {
        text = text.replaceAll(rule.regex, rule.routine);
      }
      resolve(text);
    });
  }
}
