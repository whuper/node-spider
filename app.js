var cheerio = require('cheerio');
var superagent = require('superagent');

var async = require('async');

// 并发连接数的计数器
var concurrencyCount = 0;

var counterfeitUrls = [];
for(var i = 0; i < 30; i++) {
  counterfeitUrls.push('http://datasource_' + i);
}

async.mapLimit(counterfeitUrls, 5, function (url, callback) {
  fetchUrl(url, callback);
}, function (err, result) {
  console.log('final:');
  writeJson(result);
});

return;

// extend with Request#proxy()
require('superagent-proxy')(superagent);

// HTTP, HTTPS, or SOCKS proxy to use
// http://61.135.169.121:443  'http://127.0.0.1:1080'
var proxy = process.env.http_proxy || 'http://127.0.0.1:1080';


//var index_url = 'http://www.tokyo-hot.com/product/?page=';
var index_url = 'https://news.cnblogs.com/n/page/';
var cur_page = 1;

superagent
	.get(index_url + cur_page)
	.set('Accept', 'application/json')
	.proxy(proxy)
	.end(onresponse);



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

	//保存到数据库里
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('./nodespider.db');

	db.serialize(function() {
		//db.run("CREATE TABLE lorem (info TEXT)");
		var stmt = db.prepare("INSERT INTO tokyohot(id,title,designation,videoName,actor,url,soucePage) VALUES (?,?,?,?,?,?,?,?,?)");
		items.forEach(function(item) {
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
function fetchUrl(url, callback) {
  // delay 的值在 2000 以内，是个随机的整数
  var delay = parseInt((Math.random() * 10000000) % 2000, 10);
  concurrencyCount++;
  console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
  setTimeout(function () {
    concurrencyCount--;
    callback(null, url + ' html content');
  }, delay);
};
