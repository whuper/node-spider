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

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./nodespider.db');

// extend with Request#proxy()
require('superagent-proxy')(superagent);

var proxy = process.env.http_proxy || 'http://127.0.0.1:'  + port ;

var timeOut;

var basic_url = 'https://www.amorz.com';
var cur_page = 1;

//var sqlStr = `SELECT id,cover FROM amorz limit 1738, 1920`;
var sqlStr = `SELECT id,cover FROM amorz where coverImgUrl IS NULL`;
db.all(sqlStr, function(err, rows) {
	if (err) {
		console.log(err);
		writejson(err);
	}
	async.mapLimit(rows, 4, function(row, callback) {
		toRequest(row, callback);
	});

});
//db.close();
function toRequest(row, callback) {
	var url = row['cover'];
	var id = row['id'];
	console.log('\x1B[36m%s\x1B[0m:', 'request ' + url + ' id ' + id);

	superagent.get(url).proxy(proxy).end(function(err, res) {
		if (err) {
			console.log(err);
			writejson(err);
		} else {
			//var $ = cheerio.load(res.text);
			var $ = cheerio.load(res.text, {
				decodeEntities: false
			});

		
			var posterImg = basic_url + $('a img').attr('src');

			var itemInfo = {
				id: id,
				posterImg: posterImg			
			}
			updateDb(itemInfo);
			//回调
			callback();
		}
	});

}

function updateDb(item) {

	if (!item.id) {
		console.log('#####id为空');
		return;
	}
	// 更新到数据库里
	var modify = db.prepare("UPDATE amorz SET coverImgUrl = ? WHERE id = ?");
	modify.run(item.posterImg, item.id);
	modify.finalize();

	//console.log('\x1B[36m%s\x1B[0m','###开始下一个');
	/*timeOut = setTimeout(function(){
			toRequest(basic_url + cur_page);
		},1000);*/

	//db.close();
}

