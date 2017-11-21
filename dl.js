var sqlite3 = require('sqlite3').verbose();
var downloader = require('./downloader');
var writejson = require('./writejson');
var os=require('os');
var platform = os.platform();

var fs=require("fs");
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
	var downloadRootDir = __dirname + '/downloads/tokyohot/posters/';
	var tmpdownloadDir = '';

	var curpage = 1;
	var pagesize = 10; 

	//querydb(curpage);
	
	//downloadImg('http://dlsw.baidu.com/sw-search-sp/soft/f2/25836/1Sublime_Text.1395998182.dmg','ttf.dmg');
	//downloadImg('http://my.cdn.tokyo-hot.com/media/ubt859/list_image/20171111022805/220x124_default.jpg','ubt859.jpg');
	//downloadImg('http://webmail.ngarihealth.com/custom_login/images/domain_logo.png');
	
	var schedules =	setInterval(function(){
		querydb();	
	},5000)
	

function querydb(page){

	var start = (curpage - 1) * pagesize + 1;
	var sqlStr = `SELECT id,posterImg,actor FROM tokyohot limit ${start},${pagesize}`;
	db.each(sqlStr,function(err, row){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		 var imgName = row['actor'].replace(/[\s+\(\):]/g,"") + '.jpg';
		
		 //console.log(imgName);
		var itemId = row['id'];
		var folder_size = 500
        var folder_name = 'within_' + String( ( parseInt( (itemId - 1) / folder_size) + 1) * folder_size );
        tmpdownloadDir = downloadRootDir + folder_name + '/';
       
        if( !fs.existsSync(tmpdownloadDir) ){
            fs.mkdirSync(tmpdownloadDir);
        }
		
		if(row['posterImg']){
			console.log(row['posterImg']);
		 downloadImg(row['posterImg'],imgName,tmpdownloadDir);
		} else {
			console.log(row['id'] + ' null');
		}
	});
	curpage += 1;
}

function downloadImg(url,imgName,downloadDir){

downloader.on('done', function(msg) {
	console.log('\x1B[36m%s\x1B[0m:',msg);
});

downloader.on('error', function(msg) {
	console.log('\x1B[36m%s\x1B[0m',msg);
	writejson(msg);
});

downloader.download(url, downloadDir,true,imgName);

}
