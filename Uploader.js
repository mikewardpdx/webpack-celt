const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const serverOptions = require('../serverOptions.json');
const https = require('https');
const { Stream } = require('stream');
const { resolve } = require('path');

const pathOptions = {
  mediLibraryPath: '/-/script/media/master',
  removeScriptPath: '/-/script/v2/master/RemoveMedia',
  updateScribanPath: '/-/script/v2/master/ChangeScriban',
  updateTemplatePath: '/-/script/v2/master/ChangeTemplate',
  uploadScriptPath: '/sitecore modules/PowerShell/Services/RemoteScriptCall.ashx',
};

module.exports = class Uploader {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise('upload', compilation => {
      return new Promise((resolve) => {
        const assetsProm = [];
        const that = this;
        serverOptions.assets.forEach(asset => {
          assetsProm.push(new Promise((resolve) => {
            that.uploadAsset(asset, resolve);
          }))
        });
        this.getScribanStreams(compilation.options.context).then(streams => {
          streams.forEach(stream => {
            assetsProm.push(new Promise((resolve) => {
              that.uploadScriban(stream, resolve);
            }))
          });
        });
        Promise.all(assetsProm).then(resolve);
      });
    });
  }

  uploadAsset(asset, resolve) {
    const url = [
      serverOptions.server,
      pathOptions.uploadScriptPath,
      '?user=',
      serverOptions.user,
      '&password=',
      serverOptions.password,
      '&script=',
      serverOptions.projectPath,
      serverOptions.themePath,
      '/',
      asset.path,
      '&sc_database=master&apiVersion=media&scriptDb=master'
    ].join('');

    const data = new FormData();
    data.append('file', fs.createReadStream(asset.src));

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    axios({
      method: 'POST',
      url,
      data,
      httpsAgent,
      headers: data.getHeaders()
    }).then((res) => {
      resolve();
      if (res.status !== 200) {
        return console.log(`Upload failed: ${res.statusText}`);
      } else {
        return console.log(`${asset.path} Upload was successful!`);
      }
    }).catch(err => {
      return console.log(`Upload failed: ${err}`);
    });
  }

  uploadScriban(stream, resolve) {
    let url = [
      serverOptions.server,
      pathOptions.updateScribanPath,
      '?user=',
      serverOptions.user,
      '&password=',
      serverOptions.password,
      '&path=',
      stream.path
    ].join('');

    const cleanStream = (s) => ([{ path: s.path.replace(/\\/g, "/"), content: s.content }]);

    const data = new FormData();
    data.append('streams', JSON.stringify(cleanStream(stream)));
    data.append('metadata', JSON.stringify(serverOptions.siteMetadata));

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    axios({
      method: 'POST',
      url,
      data,
      httpsAgent,
      headers: data.getHeaders()
    }).then((res) => {
      resolve();
      if (res.status !== 200) {
        return console.log(`Upload failed: ${res.statusText}`);
      } else {
        return console.log(`Scriban Upload was successful!`);
      }
    }).catch(err => {
      resolve();
      return console.log(`Upload failed: ${err}`);
    });
  }

  getScribanStreams(context) {
    const scribs = glob.sync('./**/*.scriban');
    const streams = [];
    const promises = []
    const that = this;

    scribs.forEach(scrib => {
      promises.push(new Promise((resolve) => {
        fs.readFile(scrib, 'utf8', (err, data) => {
          const b = new Buffer.from(data);
          const stream = {
            path: path.join(context, scrib),
            content: b.toString('base64')
          }
          streams.push(stream);
          resolve();
        });
      }));
    });
    return Promise.all(promises).then(() => {
      return streams;
    });
  }
}
