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

	var sqlStr = `SELECT id,posterImg,actor FROM tokyohot where posterImg is not null`;
	db.all(sqlStr,function(err, rows){
		 if (err){
		 console.log(err);
		 writejson(err);
		 }
		 async.mapLimit(rows, 15, function (row, callback) {
          toDownload(row,callback);
        });

	});

	/*var schedules =	setInterval(function(){
		querydb();	
	},5000)*/
	

function toDownload(row,callback){
		var imgName = row['actor'].replace(/[\s+\(\):]/g,"") + '.jpg';
		 //console.log(imgName);
		var itemId = row['id'];
		var folder_size = 500
        var folder_name = 'within_' + String( ( parseInt( (itemId - 1) / folder_size) + 1) * folder_size );
        tmpdownloadDir = downloadRootDir + folder_name + '/';
        if( !fs.existsSync(tmpdownloadDir) ){
            fs.mkdirSync(tmpdownloadDir);
        }
		httpGet(row['posterImg'],tmpdownloadDir,imgName,true,callback);
}


function httpGet(imgurl,dir,filename,proxy,callback) {
		if(proxy){
			var options = {
				host : '127.0.0.1',
				port : port,
				path : imgurl,
				headers:{
						'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
						'Accept-Encoding':'gzip, deflate',
						'Accept-Language':'zh-CN,zh;q=0.8',
						'Cache-Control':'max-age=0',
						'Cookie':'__cfduid=d1e638e7718ca80789c37af200cde6c751510819535',
						'Host':'my.cdn.tokyo-hot.com',
						'Proxy-Connection':'keep-alive',
						'Upgrade-Insecure-Requests':'1',
						'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
			}
		} ;
	} else {
		var options = {
		  host: url.parse(imgurl).hostname,
		  port: url.parse(imgurl).port,
		  path: url.parse(imgurl).pathname
		};
	}
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

