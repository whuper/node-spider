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

var AipSpeechClient = require("baidu-aip-sdk").speech;

// 设置APPID/AK/SK
var APP_ID = "11405723";
var API_KEY = "nTrfKypNEi2n59hGCzy0oBcY";
var SECRET_KEY = "EL3HrYAv2l8g3hq5TxnMX7rMCj0mkLp4";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);

var utilHao = require('./libs/util-hao.js');




var fs=require("fs");

var db = new sqlite3.Database('D:/nodejs/electron/electron-ui-route/assets/wenhaotest.db');

	var downloadRootDir = __dirname + '/downloads/baiduSpeech/';
	var tmpdownloadDir = '';


	//var sqlStr = `SELECT id,posterImg,actor FROM english where posterImg is not null and id > 1445`;
	var sqlStr = `SELECT id,example FROM english limit 0,5`;

	db.all(sqlStr,function(err, rows){
		 if (err){
			 console.log(err);
			 writejson(rows);
		 }

		 async.mapLimit(rows, 10, function (row, callback) {
					var examples = row['example'] ? row['example'].split("#"):[];

					for (var i = 0; i < examples.length; i++) {
						var sentence = examples[i];
						//从英文句子中,去除中文

							let stop = sentence.search(/[\u4e00-\u9fa5]/);
							if(stop != -1 && stop > 0){
								var enSentence = sentence.substring(0,stop);
							} else {
								var enSentence = sentence;
							}
							let audioName = utilHao.excludeSpecial(enSentence,' ');

							toDownload(enSentence,audioName,row['id'],callback);

					};

         
        });

	});

function toDownload(sentence,audioName,itemId,callback){
	
		var folder_size = 500;
    var folder_name = 'within_' + String( ( parseInt( (itemId - 1) / folder_size) + 1) * folder_size );
        tmpdownloadDir = downloadRootDir + folder_name + '/';

        if( !fs.existsSync(tmpdownloadDir) ){
            fs.mkdirSync(tmpdownloadDir);
        }
				console.log('itemId # ' + itemId);

				save(tmpdownloadDir,sentence,audioName,callback);
			
}


function save(dir,sentence,audioName,callback) {

		
		let fielName = dir + audioName + '.mp3';
		client.text2audio(sentence).then(function(result) {
			if (result.data) {
					fs.writeFile(fielName,result.data,function(err){
								 if (err) throw err;
								
								 if(callback){
									callback();
								 }
					
					});
			} else {
					// 服务发生错误
					console.log(result)
			}
	}, function(e) {
			// 发生网络错误
			console.log(e)
	});

}

