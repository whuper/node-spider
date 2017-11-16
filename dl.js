var sqlite3 = require('sqlite3').verbose();
var downloader = require('./downloader');
var writejson = require('./writejson');


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
	var downloadDir = __dirname + '/downloads/tokyohot/';

	var curpage = 1;
	var pagesize = 10; 

	//querydb(curpage);
	
	//downloadImg('http://dlsw.baidu.com/sw-search-sp/soft/f2/25836/1Sublime_Text.1395998182.dmg','ttf.dmg');
	//downloadImg('http://my.cdn.tokyo-hot.com/media/ubt859/list_image/20171111022805/220x124_default.jpg','ubt859.jpg');
	//downloadImg('http://webmail.ngarihealth.com/custom_login/images/domain_logo.png');
	
	var schedules =	setInterval(function(){
		querydb();	
	},3000)
	

function querydb(page){

	var start = (curpage - 1) * pagesize + 1;
	var sqlStr = `SELECT coverSrc,actor FROM tokyohot limit ${start},${pagesize}`;
	db.each(sqlStr,function(err, rows){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		 var imgName = rows['actor'].replace(/[\s+\(\):]/g,"") + '.jpg';
		
		 //console.log(imgName);
		 downloadImg(rows['coverSrc'],imgName);
	});
	curpage += 1;
	if(curpage > 3){
	process.exit()
	}
}

function downloadImg(url,imgName){

downloader.on('done', function(msg) {
	console.log('\x1B[36m%s\x1B[0m:',msg);
});

downloader.on('error', function(msg) {
	console.log('\x1B[36m%s\x1B[0m',msg);
	writejson(msg);
});

downloader.download(url, downloadDir,true,imgName);

}
