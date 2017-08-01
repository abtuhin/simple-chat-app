var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongo = require('mongodb')

mongoClient = mongo.MongoClient;

mongoClient.connect('mongodb://127.0.0.1/chat', function(err,db){
  if(err) throw err;
  console.log("Successfully connected to mongo");
  var col = db.collection('messages');


  io.on('connection', function(socket){
    socket.emit('news', { hello: 'world' });
    sendStatus = function(s){
      socket.emit('status',s);
    }

    // emit all messages
    col.find().limit(10).sort({_id: 1}).toArray(function(err, res){
      if(err) throw err;
      socket.emit('output', res);
    })

    // waiting for inputs
    socket.on('input', function(data){
      var name = data.name;
      var message = data.message;
      var whiteSpace = /^\s*$/;

      if(whiteSpace.test(name) || whiteSpace.test(message)){
        sendStatus('Name and message is required');
      }else{
        col.insert({name:name, message:message}, function(){
          // emit latest message to all
          io.emit('output', [data]);

          sendStatus({
            message: "message sent",
            clear: true
          });
        });
      }
    });
  });

});

server.listen(80, function(){
  console.log("server running on port 80");
});

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
