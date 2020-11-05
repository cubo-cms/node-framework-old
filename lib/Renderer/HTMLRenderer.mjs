/** @package        @cubo-cms/node-framework
  * @module         /lib/Renderer/HTMLRenderer.mjs
  * @version        0.3.23
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class HTMLRenderer extends Namespace.Renderer {
  /** @property {object} format - holds routines to format tag values
    **/
  format = {
    count: (str) => {       // Returns count
      return str.length;
    },
    ucase: (str) => {       // Returns uppercase
      return str.toUpperCase();
    },
    lcase: (str) => {       // Returns lowercase
      return str.toLowerCase();
    },
    tcase: (str) => {       // Returns titlecase (first letter of each word caps)
      let word = str.toLowerCase().split(' ');
      for(let i = 0; i < word.length; i++) {
        word[i] = word[i].charAt(0).toUpperCase() + word[i].substring(1);
      }
      return word.join(' ');
    }
  };
  /** @property {object} rule - holds rules to render tags
    **/
  rule = {
    each: {                 // Each block
      regex: /\{\s*each\s*([\w_-]+)\s*of\s*([\w_.-]+)\s*\}([\s\S]*)\{\/\s*each\s*\}/gm,
      routine: (str, match) => {
        if(Array.isArray(this.data[match[1]])) {
          let result = '';
          for(const item of this.data[match[1]]) {
            this.data[match[0]] = item;
            result += this.render(match[2]);
          }
          return result;
        } else
          return this.render(match[2]);
      }
    },
    comment: {              // Comment (left out)
      regex: /\{#(.*)\}/gm,
      routine: (str, match) => {
        return '';
      }
    },
    variable: {             // Variable
      regex: /\{=\s*([\w_.-]+)(\->[^\}]+)?\s*\}/gm,
      routine: (str, match) => {
        let parts = match[0].split('.');
        let result = this.data;
        for(const part of parts) {
          if(result[part]) {
            result = result[part];
          } else {
            return str;
          }
        }
        if(match[1]) {
          let format = match[1].substring(2);
          return this.format[format] ? this.format[format](result) : result;
        } else {
          return result;
        }
      }
    }
  };
}
