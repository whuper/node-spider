var sqlite3 = require('sqlite3').verbose();
var downloader = require('./downloader');
var writejson = require('./writejson');
var mkdirp = require('mkdirp');
var async = require('async');
var http = require('http');

var os=require('os');
var platform = os.platform();

if(platform == 'win32'){
  var port = 1080;	  
} else {
var port = 1087;
}        


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

	// 创建目录
	/*
	mkdirp(downloadRootDir, function(err) {
		if(err){
			console.log(err);
		}
	});
	*/

	var sqlStr = `SELECT id,posterImg,actor FROM tokyohot where posterImg is not null and id > 1445`;
	db.all(sqlStr,function(err, rows){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		 async.mapLimit(rows, 15, function (row, callback) {
          toDownload(row,callback);
        });

	});

function toDownload(row,callback){
		var audioName = row['actor'].replace(/[\s+\(\):]/g,"") + '.jpg';
		var itemId = row['id'];
		var folder_size = 500
        var folder_name = 'within_' + String( ( parseInt( (itemId - 1) / folder_size) + 1) * folder_size );
        tmpdownloadDir = downloadRootDir + folder_name + '/';
        if( !fs.existsSync(tmpdownloadDir) ){
            fs.mkdirSync(tmpdownloadDir);
        }
		var tmpurl = encodeURI(row['posterImg']);
		console.log(tmpurl);
		httpGet(tmpurl,tmpdownloadDir,audioName,callback);
			
}


function httpGet(fileurl,dir,filename,callback) {

		var options = {
		  host: url.parse(fileurl).hostname,
		  port: url.parse(fileurl).port,
		  path: url.parse(fileurl).pathname
		};

    http.get(options, function (res) {
                res.setEncoding('binary');//转成二进制
                var content = '';
                res.on('data', function (data) {
                   content+=data;
                }).on('end', function () {
                   fs.writeFile(dir + filename,content,'binary', function (err) {
                       if (err) throw err;
                       console.log('## save ' + filename);
											 if(callback){
												callback();
											 }
                   });

                });
			});

}

/*function downloadImg(url,imgName,downloadDir){

downloader.on('done', function(msg) {
	console.log('\x1B[36m%s\x1B[0m:',msg);
});

downloader.on('error', function(msg) {
	console.log('\x1B[36m%s\x1B[0m',msg);
	writejson(msg);
});

downloader.download(url, downloadDir,true,imgName);

}

function download(uri, dir,filename){  
    request.head(uri, function(err, res, body){  
        request(uri).pipe(fs.createWriteStream(dir + "/" + filename));  
    });  
};     

*/


