/*
 * Copyright (c) 2012 Hendrix Tavarez
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var http = require('http');
var url = require('url');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
//var util = require('util');
var os=require('os');


var platform = os.platform();
if(platform == 'win32'){
  var port = 1080;	  
} else {
var port = 1087;
}

var Downloader = (function() {

	var that = new EventEmitter();

  function request (options, outputDir, filename, maxFileSize) {
    http.get(options, function(res) {
      if(res.statusCode === 200) {
        var filesize = res.headers['content-length'];
        if(filesize <= maxFileSize) {
          var downloadfile = fs.createWriteStream( outputDir + filename, {
            flags: 'a',
            encoding: 'binary'
          });

          res.on('error', function(err) {
            that.emit('error', '[FILE DOWNLOAD ERROR - DATA] ' + err);
          });
          res.on('data', function(chunk) {
            downloadfile.write(chunk);
          });
          res.on('end', function() {
            downloadfile.end();
            that.emit('done', outputDir + filename );
          });
        } else {
          console.log('maxFileSize = ' + maxFileSize + ' filesize = ' + filesize);
          that.emit('error', '[REQUEST FAILED] file size > ' + maxFileSize + ' bytes. File size = ' + filesize);
        }
      } else {
        that.emit('error', '[REQUEST FAILED] ' + res.statusCode + ' PATH ' + options.path);
      }
    });
  }

  function download(theUrl, outputDir,proxy,trueName,maxFileSize) {



	if(proxy){
		options = {
			host : '127.0.0.1',
			port : port,
			path : theUrl,
			headers:{
					'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
					'Accept-Encoding':'gzip, deflate',
					'Accept-Language':'zh-CN,zh;q=0.8',
					'Cache-Control':'max-age=0',
					'Cookie':'__cfduid=d1e638e7718ca80789c37af200cde6c751510819535',
					'Host':'my.cdn.tokyo-hot.com',
					'Proxy-Connection':'keep-alive',
					'Upgrade-Insecure-Requests':'1',
					'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
		}
	} ;
	} else {
		options = {
		  host: url.parse(theUrl).hostname,
		  port: url.parse(theUrl).port,
		  path: url.parse(theUrl).pathname
		};
	}

    outputDir = outputDir || './';

    filename = trueName ? trueName: options.path.split("/").pop();

    maxFileSize = maxFileSize || 1000000000; // default to 100MB

    request(options, outputDir, filename, maxFileSize);
  }

  that.download = download;

  //util.inherits(that, EventEmitter);

  return that;

}());


module.exports = Downloader;
