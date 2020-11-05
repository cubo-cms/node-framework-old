/** @package        @cubo-cms/node-framework
  * @module         /lib/Core/Template.mjs
  * @version        0.3.23
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Template extends Namespace.Core {
  /** @property {object} render - holds view methods
    **/
  render = {
    template: function() {
      return new Promise((resolve, reject) => {
        let template = this.get('template');
        if(template) {
          Namespace.Core.loadFile(template)
            .then((template) => {
              Namespace.HTMLRenderer.create(this.data, this)
                .then((renderer) => {
                  console.log(this.get('content'));
                  let data = renderer.render(template);
                  console.log(data);
                  resolve(renderer.render(template));
                }).catch((error) => {
                  reject(Namespace.JResponse.respond('badRequest', { message: 'View cannot load template' }));
                });
            }).catch((error) => {
              reject(error);
            });
        } else {
          reject(Namespace.JResponse.respond('badRequest', { message: 'Template cannot load template file' }));
        }
      });
    }
  }

  /** @property {object} default - holds default values
    **/
  default = {
    template: '#/template/default.html'
  }

  /** @function view()
    * Getter to retrieve the controller object
    * @return {object}
    **/
  get view() {
    return this.caller;
  }

  /** @function invokeRender()
    * Invokes view render and returns processed data
    * @return {Promise <object>}
    **/
  invokeRender() {
    return new Promise((resolve, reject) => {
      Namespace.Log.info({ message: `Template invokes render \"template\"`, source: this.name });
      let template = this.render['template'].bind(this);
      resolve(template());
    }).catch((error) => {
      reject(error);
    });
  }
}
