var cheerio = require('cheerio');
var superagent = require('superagent');

var async = require('async');

var writejson = require('./writejson');
var helloword = require('./helloword');


var platform = os.platform();
if(platform == 'win32'){
  var port = 1080;	  
} else {
var port = 1087;
}

//writejson({data:'dasda'});


helloword('ddd');
return;
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./nodespider.db');
/*
	db.serialize(function() {
		//db.run("CREATE TABLE lorem (info TEXT)");

		stmt.finalize();
		db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
			  console.log(row.id + ": " + row.info);
		  });
	});

	db.close();
	*/



/*
var apkurl = 'http://dlsw.baidu.com/sw-search-sp/soft/f2/25836/1Sublime_Text.1395998182oo.dmg';

var downloader = require('./downloader');

var downloadDir = __dirname + '/tmp/';

downloader.on('done', function(msg) {
	console.log('####'+msg);
});

downloader.on('error', function(msg) {
	console.log('###'+msg);
});

downloader.download(apkurl, downloadDir);
*/


var header = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
    'Host': 'www.tokyo-hot.com',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive'
};


// extend with Request#proxy()
require('superagent-proxy')(superagent);

// HTTP, HTTPS, or SOCKS proxy to use
// http://61.135.169.121:443  'http://127.0.0.1:1080'
var proxy = process.env.http_proxy || 'http://127.0.0.1:' + port ;

var timeOut;

var basic_url = 'http://www.tokyo-hot.com/product/?page=';
//var basic_url = 'https://news.cnblogs.com/n/page/';
var cur_page = 1;

toRequest(basic_url + cur_page);


function toRequest(url){
	console.log('\x1B[36m%s\x1B[0m:','request' + url);
	superagent
		.get(url)
		//.set('header',header)
		.proxy(proxy)
		.end(onresponse);

}

function onresponse (err, res) {
  if (err) {
    console.log(err);
	writeJson(err);
  } else {
    //console.log(res.status, res.headers);
		var $ = cheerio.load(res.text);
		var items = [];
		$('ul.list li.detail').each(function(idx, element) {
			var $element = $(element);
			var a_element = $element.find('a.rm');
			var desc_element = a_element.find('.description2');
			items.push({
				href: a_element.attr('href'),
				coverSrc: a_element.find('>img').attr('src'),
				title: desc_element.find('.title').text(),
				actor: desc_element.find('.actor').text(),
				text: desc_element.find('.text').text()
			});
	});

		insertDb(items);
		cur_page += 1;
	
  }
}


function insertDb(items){

	//保存到数据库里
		var stmt = db.prepare("INSERT INTO tokyohot(id,title,designation,videoName,actor,videoUrl,url,text,coverSrc,soucePage) VALUES (?,?,?,?,?,?,?,?,?,?)");
		items.forEach(function(item,index) {
			console.log(item);
			stmt.run(null, item.title, null, null, item.actor, null,item.href,item.text,item.coverSrc,basic_url+cur_page);
		})
		stmt.finalize();

		console.log('\x1B[36m%s\x1B[0m','###开始下一个');
		timeOut = setTimeout(function(){
			toRequest(basic_url + cur_page);
		},1000);

		
		//db.close();
}


