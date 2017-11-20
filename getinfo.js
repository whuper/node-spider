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

var sqlStr = `SELECT id,url FROM tokyohot limit 1000,3000`;
	db.all(sqlStr,function(err, rows){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		 //var imgName = rows['actor'].replace(/[\s+\(\):]/g,"") + '.jpg';
		
		 //console.log(imgName);
		          
        async.mapLimit(rows, 4, function (row, callback) {
          //fetchUrl(url, callback);
          toRequest(row,callback);
        });


	});
    //db.close();

function toRequest(row,callback){
     var url = basic_url + row['url'];
     var id = row['id'];
	console.log('\x1B[36m%s\x1B[0m:','request ' + url + ' id ' + id);

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
					updateDb(itemInfo);
                    //回调
                    callback();
			  }
					});

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

		//console.log('\x1B[36m%s\x1B[0m','###开始下一个');
		/*timeOut = setTimeout(function(){
			toRequest(basic_url + cur_page);
		},1000);*/

		//db.close();
}


