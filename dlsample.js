var sqlite3 = require('sqlite3').verbose();
var downloader = require('./downloader');
var writejson = require('./writejson');


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
	var downloadRootDir = __dirname + '/downloads/tokyohot/samples/';
    var tmpdownloadDir = '';

	//querydb(curpage);
	
	//downloadImg('http://dlsw.baidu.com/sw-search-sp/soft/f2/25836/1Sublime_Text.1395998182.dmg','ttf.dmg');
	//downloadImg('http://my.cdn.tokyo-hot.com/media/ubt859/list_image/20171111022805/220x124_default.jpg','ubt859.jpg');
	//downloadImg('http://webmail.ngarihealth.com/custom_login/images/domain_logo.png');
	
/*
	var schedules =	setInterval(function(){
		querydb();	
	},3000)
    */
var list = [];
var itemNo = 0;
var sqlStr = `SELECT id,videoUrl,actor FROM tokyohot limit 0,10 `;
db.all(sqlStr,function(err, rows){
 if (err){
 console.log(err);
 writejson(err);
 }
 list = rows;
    toDownload();
    });


function toDownload(){

        var item = list[itemNo];
        if(item && item['actor']){
            var videoName = item['actor'].replace(/[\s+\(\):]/g,"") + '_' + item['id'] + '.mp4';
        }else {
            var videoName = 'id' + item['id'] + '.mp4';
        }

        if(!item['videoUrl']){
                itemNo += 1;
                toDownload();
                return;                        
        }
        var itemId = item['id'];

        var folder_size = 500
        var folder_name = 'within_' + String( ( parseInt( (itemId - 1) / folder_size) + 1) * folder_size );

        tmpdownloadDir = downloadRootDir + folder_name + '/';
       
        if( !fs.existsSync(tmpdownloadDir) ){
            fs.mkdirSync(tmpdownloadDir);
        }

        downloadVideo(item['videoUrl'],'',tmpdownloadDir);
       

}
function downloadVideo(url,name,downloadDir){

downloader.on('done', function(msg) {
	console.log('\x1B[36m%s\x1B[0m:','###done' + msg);
     itemNo += 1;

     //toDownload();

});

downloader.on('error', function(msg) {
	console.log('\x1B[36m%s\x1B[0m',msg);
	writejson(msg);
});

downloader.download(url, downloadDir,true,name);

}
