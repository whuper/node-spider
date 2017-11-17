var cheerio = require('cheerio');
var superagent = require('superagent');

var async = require('async');

var writejson = require('./writejson');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./nodespider.db');

// extend with Request#proxy()
require('superagent-proxy')(superagent);

// HTTP, HTTPS, or SOCKS proxy to use
// http://61.135.169.121:443  'http://127.0.0.1:1080' 'http://127.0.0.1:1087'

var proxy = process.env.http_proxy || 'http://127.0.0.1:1087';

var timeOut;

var basic_url = 'http://www.tokyo-hot.com';
//var basic_url = 'https://news.cnblogs.com/n/page/';
var cur_page = 1;

var sqlStr = `SELECT id,url FROM tokyohot limit 0,1`;
	db.each(sqlStr,function(err, rows){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		 //var imgName = rows['actor'].replace(/[\s+\(\):]/g,"") + '.jpg';
		
		 //console.log(imgName);
		 toRequest(basic_url + rows['url'],rows['id']);
	});

function toRequest(url,id){
	console.log('\x1B[36m%s\x1B[0m:','request ' + url);
	superagent
		.get(url)
		.proxy(proxy)
		.end(function(err, res){
			if (err) {
				console.log(err);
				writejson(err);
			  } else {
					//var $ = cheerio.load(res.text);
                   var $ = cheerio.load(res.text,{decodeEntities: false}); 

                    var sampleSrc = $('.flowplayer>video>source').attr('src');
					var posterImg = $('.flowplayer>video').attr('poster');
					var actorInfo = $('.infowrapper').html();
                        actorInfo = actorInfo.replace(/[\n+\s+\(\):]/g,"") 
					var scap_list = [];
					$('div.scap a').each(function(idx, element){
						scap_list.push($(element).attr('href'));
								
					});
						var itemInfo = {
							id: id,
							sampleSrc: sampleSrc,
							posterImg: posterImg,
							actorInfo: actorInfo,
							scap_list: JSON.stringify(scap_list)
						}
						writejson(itemInfo);
					updateDb(itemInfo);
                     console.log('itemInfo.actorInfo',itemInfo.actorInfo);
					cur_page += 1;
				
			  }
					});

}

function onresponse (err, res) {

}

function updateDb(item){

	if(!item.id){

		console.log('#####id为空');
		return;
	
	}
	// 更新到数据库里
		var modify = db.prepare("UPDATE tokyohot SET actorInfo = ?,videoUrl = ?,posterImg = ?,vcapList= ? WHERE id = ?");
		modify.run(item.actorInfo,item.sampleSrc,item.posterImg,item.scap_list,item.id);
		modify.finalize();

		console.log('\x1B[36m%s\x1B[0m','###开始下一个');
		/*timeOut = setTimeout(function(){
			toRequest(basic_url + cur_page);
		},1000);*/

		//db.close();
}



