var cheerio = require('cheerio');
var superagent = require('superagent');

var async = require('async');

var nodeDownloader = require('node-downloader');


var apkurl = 'http://down.sandai.net/mac/thunder_3.1.7.3266.dmg';

	var download = new nodeDownloader.NodeDownloader();

	download.setDirToSave('./tmp/');
	download.downloadFile(apkurl);
	
	download.eventEmitter.on('progress', function(percent, speed) {
		console.log('percent: ' + percent);
		console.log('speed: ' + speed);
			});

	// just to stop
	setTimeout(function() {
						download.stopDownload();
					}, 3000);



// extend with Request#proxy()
require('superagent-proxy')(superagent);

// HTTP, HTTPS, or SOCKS proxy to use
// http://61.135.169.121:443  'http://127.0.0.1:1080'
var proxy = process.env.http_proxy || 'http://127.0.0.1:1080';

var timeOut;

//var basic_url = 'http://www.tokyo-hot.com/product/?page=';
var basic_url = 'https://news.cnblogs.com/n/page/';
var cur_page = 1;

//toRequest(basic_url + cur_page);


function toRequest(url){
	superagent
		.get(url)
		.set('Accept', 'application/json')
		.proxy(proxy)
		.end(onresponse);

}

function onresponse (err, res) {
  if (err) {
    console.log(err);
  } else {
    /*console.log(res.status, res.headers);
    console.log(res.body);*/
		var $ = cheerio.load(res.text);
		var items = [];
		$('ul.list li.detail').each(function(idx, element) {
			var $element = $(element);
			var a_element = $element.find('a.rm');
			var desc_element = a_element.find('.description2');
			items.push({
				href: a_element.attr('href'),
				cover: a_element.find('>img').attr('src'),
				title: desc_elementfind('.title').text(),
				actor: desc_element.find('.actor').text(),
				text: desc_element.find('.text').text()
			});
	});

		insertDb(items);
		cur_page += 1;

		timeOut = setTimeout(function(){
			toRequest(basic_url + cur_page);
		},1000);

		
  }
}


function insertDb(items){

	//保存到数据库里
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./nodespider.db');

	db.serialize(function() {
		//db.run("CREATE TABLE lorem (info TEXT)");
		var stmt = db.prepare("INSERT INTO tokyohot(id,title,designation,videoName,actor,url,soucePage) VALUES (?,?,?,?,?,?,?,?,?)");
		items.forEach(function(item,index) {
			console.log(item);
			stmt.run(null, item.title, null, null, item.actor, null, item.href,item.text,item.over,index_url+cur_page);
		})
		stmt.finalize();
		/*db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
			  console.log(row.id + ": " + row.info);
		  });*/
	});

	db.close();

}

function writeJson(data){

		var dataBuf = '\n --***-- ' + (new Date()) + '\n ' + JSON.stringify(data);
		var fs = require('fs');
		var logfile = './result.txt';
		fs.exists(logfile, function(exists) {  
			if(exists){
					fs.stat(logfile, function (err,stats) {
						if(err) 
							throw err;
						//如果日志文件大于20KB,就使用覆盖模式
						if(parseInt(stats.size) > 10240*2){
							var flag = 'w';
						} else {
							var flag = 'a';
						}	
						fs.writeFile(logfile,dataBuf,{
							flag: flag
						}, function(err){
							if(err) 
								throw err;
						});
					
					})
			
			}else {
				fs.writeFile(logfile,dataBuf,{
						flag: 'w'
					}, function(err){
						if(err) 
							throw err;
					});
			} 
		}); 
		//写入文件END-----

}

