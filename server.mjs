/** @package        @cubo-cms/node-framework
  * @module         /server.mjs
  * @version        0.3.23
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Cubo from './Namespace.mjs';
await Cubo.load();

const { Application } = Cubo;

const app = new Application();
app.success(() => {
  app.start();
});
