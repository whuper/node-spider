function WriteJson(data){
		var dataBuf = '\n --***-- ' + (new Date()) + '\n ' + JSON.stringify(data,null,4);
		var fs = require('fs');
		var logfile = './result.txt';
		fs.exists(logfile, function(exists) {  
			if(exists){
					fs.stat(logfile, function (err,stats) {
						if(err) 
							throw err;
						//如果日志文件大于20KB,就使用覆盖模式
						if(parseInt(stats.size) > 10240*2){
							var flag = 'w';
						} else {
							var flag = 'a';
						}	
						fs.writeFile(logfile,dataBuf,{
							flag: flag
						}, function(err){
							if(err) 
								throw err;
						});
					
					})
			
			}else {
				fs.writeFile(logfile,dataBuf,{
						flag: 'w'
					}, function(err){
						if(err) 
							throw err;
					});
			} 
		}); 
		//写入文件END-----

}
module.exports = WriteJson;
