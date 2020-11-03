/** @package        @cubo-cms/node-framework
  * @module         /lib/Helper/XMLParser.mjs
  * @version        0.3.22
  * @copyright      2020 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        MIT license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import fs from 'fs';
import http from 'http';
import https from 'https';
import XML from 'xml.one';

import Namespace from '../../Namespace.mjs';

export default class XMLLoader extends Namespace.Core {
  /** @function loadXML(data,trigger)
    * Loads data and stores it for this instance
    * @param {string|object} data
    * @param {string} trigger
    * @return {Promise <object>}
    **/
  loadXML(data = {}, trigger = 'success') {
    return new Promise((resolve, reject) =>{
      Core.loadXML(data).then((data) => {
        this.data = Object.assign({}, data);
        resolve(this);
      }).catch((error) => {
        reject(error);
      }).finally(() => {
        this.event.emit(trigger, this);
      });
    });
  }

  /** @static @function isXML(data)
    * Returns true if data is valid XML
    * @param {string} data
    * @return {boolean}
    **/
  static isXML(data) {
    return true;
  }
  /** @static @function loadXML(data)
    * Loads data from XML and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static loadXML(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        if(this.isURL(data)) {
          const scheme = data.startsWith('http://') ? http : https;
          scheme.get(data, (response) => {
            let payload = '';
            response.on('data', (chunk) => {
              payload += chunk;
            }).on('end', () => {
              let parsedData;
              if(this.isXML(payload)) {
                parsedData = XML.parse(payload);
              } else {
                throw new Namespace.FrameworkError('No JSON or XML');
              }
              resolve(parsedData);
            }).on('error', (error) => {
              reject(error);
            });
          }).on('error', (error) => reject(error));
        } else if(this.isPath(data)) {
          let filePath = this.resolvePath(data);
          fs.readFile(filePath, 'utf8', (error, data) => {
            if(error) {
              reject(error);
            } else {
              let parsedData;
              if(this.isXML(data)) {
                parsedData = XML.parse(data);
              } else {
                throw new Namespace.FrameworkError('No JSON or XML');
              }
              resolve(parsedData);
            }
          });
        } else {
          let parsedData;
          if(this.isXML(data)) {
            parsedData = XML.parse(data);
          } else {
            throw new Namespace.FrameworkError('No JSON or XML');
          }
          resolve(parsedData);
        }
      } else if(typeof data === 'object') {
        resolve(data);
      }
    });
  }
}
