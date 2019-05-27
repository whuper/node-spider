var cheerio = require('cheerio');
var superagent = require('superagent');

var async = require('async');

var writejson = require('./writejson');
var os = require('os');

var platform = os.platform();
if(platform == 'win32'){
  var port = 1080;	  
} else {
var port = 1087;
}

//writejson({data:'dasda'});

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./nodespider.db');

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
var proxy = process.env.http_proxy || 'http://127.0.0.1:' + port ;

var timeOut;

var webUrl = 'https://www.amorz.com/';

var basic_url = 'https://www.amorz.com/AllTitles.aspx?WhichOne=1&CountPage=';
var cur_page = 1;

toRequest(basic_url + cur_page);


function toRequest(url){
	console.log('\x1B[36m%s\x1B[0m:','request' + url);
	superagent
		.get(url)
		.set('header',header)
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
		$('div.main-unit-list table tr').each(function(idx, element) {
			var $element = $(element);
			//var a_element = $element.find('span.class3 a');

			//var desc_element = a_element.find('.description2');
			var coverOnclickTxt = $element.find('span.class4').eq(1).find('a').attr('onclick');

      var href =  $element.find('span.class3 a').attr('href');
          if(!href){
              return true;
          }
      var realUrl = '';

      if(coverOnclickTxt && coverOnclickTxt.length > 5){
            //去除所有空格:
            var coverOnclickTxt = coverOnclickTxt.replace(/[\r\n\s]*/g,"");  
        
            realUrl = coverOnclickTxt.substring(coverOnclickTxt.indexOf('http'),coverOnclickTxt.indexOf('.jpg')+4);
        } else {
              return true;
        }
			items.push({
				href: href,
				designation: $element.find('span.small-txt').text(),
				cover: realUrl,
				title: $element.find('span.class3 a').text(),
        studio: $element.find('span.class4').eq(0).find('a').text(),
				releaseDate:'',
				product_images:webUrl + $element.find('td:first-child a img').attr('src')
			});
	});

    insertDb(items);
    //writejson(items);

		cur_page += 1;

    if(cur_page > 5){
      return
    }
	
  }
}


function insertDb(items){

	//保存到数据库里
		var stmt = db.prepare("INSERT INTO amorz(id,title,designation,studio,releaseDate,cover,detailUrl,product_images,soursePage) VALUES (?,?,?,?,?,?,?,?,?)");
		items.forEach(function(item,index) {
			console.log(item);
			stmt.run(null, item.title,item.designation, item.studio, item.releaseDate,item.cover,item.href,item.product_images,cur_page);
		})
		stmt.finalize();

		console.log('\x1B[36m%s\x1B[0m','### 开始下一个' + cur_page + '++');
		timeOut = setTimeout(function(){
			toRequest(basic_url + cur_page);
		},1000);

		
		//db.close();
}


