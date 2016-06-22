var MongoClient = require('mongodb').MongoClient;
var ConnectString="";
var TableName="";
function EntityMongoDbPipeline(tableName,connectString) {
    ConnectString=connectString;
    TableName=tableName;
}

function Process(data) {
  MongoClient.connect(DB_CONN_STR, function(err, db) {
  console.log("连接成功！");
  InsertData(db,data, function(result) {
     console.log(result);
     db.close();
   });
 });
}

function InsertData(db,data,callback,) {  
   //连接到表  
  var collection = db.collection(TableName);
   //插入数据
   collection.insert(datas, function(err, result) { 
    if(err)
    {
      console.log('Error:'+ err);
      return;
    }	 
    callback(result);
  });
}

function Initialize() {
    
}

function Dispose() {
    
}