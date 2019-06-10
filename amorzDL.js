var sqlite3 = require('sqlite3').verbose();
var writejson = require('./writejson');
var mkdirp = require('mkdirp');
var async = require('async');
var http = require('http');
var request = require('request');

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
	var downloadRootDir = __dirname + '/downloads/amorz/posters/';
	var tmpdownloadDir = '';

	// 创建目录
	/*
	mkdirp(downloadRootDir, function(err) {
		if(err){
			console.log(err);
		}
	});
	*/

	//var sqlStr = `SELECT id,coverImgUrl FROM amorz where coverImgUrl is not null and id > 1445`;
	var sqlStr = `SELECT id,coverImgUrl FROM amorz limit 0,2`;
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
		//var imgName = row['coverImgUrl'].replace(/[\s+\(\):]/g,"") + '.jpg';
    var imgName = row['coverImgUrl'].substring(row['coverImgUrl'].lastIndexOf('/') + 1);
		 //console.log(imgName);
		var itemId = row['id'];
		var folder_size = 1000
        var folder_name = 'within_' + String( ( parseInt( (itemId - 1) / folder_size) + 1) * folder_size );
        tmpdownloadDir = downloadRootDir + folder_name + '/';
        if( !fs.existsSync(tmpdownloadDir) ){
            fs.mkdirSync(tmpdownloadDir);
        }
		//var tmpurl = encodeURI(row['coverImgUrl']);
		var tmpurl = row['coverImgUrl'];
		console.log(itemId + ' ' + tmpurl);
		//httpGet(tmpurl,tmpdownloadDir,imgName,callback);
		//httpGet("http://my.cdn.tokyo-hot.com/media/21100/list_image/k0823.mp4_004/820x462_default.jpg",'./','test.jpg',callback);
		httpGet('https://lh3.googleusercontent.com/-uHZzQm1DGas/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcnYbaCz4boEN_HdYMqKm5VWcCZ9w/mo/photo.jpg','./','test.jpg',callback);
		
}


function httpGet(imgurl,dir,filename,callback) {

			var options = {
				host : '127.0.0.1',
				port : port,
				path : imgurl,
				headers:{
						//':authority': 'lh3.googleusercontent.com',
						//':method': 'GET',
						//':path:' :'/-uHZzQm1DGas/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcnYbaCz4boEN_HdYMqKm5VWcCZ9w/mo/photo.jpg?sz=46',
						//':scheme': 'https',
            'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
						'Accept-Encoding': 'gzip, deflate, br',
						'Accept-Language':'zh-CN,zh;q=0.9',
						'Cache-Control':'no-cache',
						'Connection': 'keep-alive',
						//'Host':'www.amorz.com',
						'Pragma': 'no-cache',
						'Proxy-Connection':'keep-alive',
						'Upgrade-Insecure-Requests':'1',
						'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
						'x-client-data': 'CJC2yQEIpbbJAQjBtskBCKmdygEIqKPKAQixp8oBCOKoygEI8anKAQjKrcoB'
                }	
} ;

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
