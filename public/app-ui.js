(function(){
  var getNode = function(s){
    return document.querySelector(s);
  }


  var statusDefault = document.getElementById("chat-status").innerHTML;
  textArea = getNode('.chat textArea');
  messages = getNode('.chat-messages');
  chatName = getNode('.chat-name');

  setStatus = function(s){
    var status = s;
    document.getElementById("chat-status").innerHTML = status;

    if(s!==statusDefault){
      var delay = setTimeout(function(){
        setStatus(statusDefault);
        clearInterval(delay);
      },3000);
    }

  };


  try{
    var socket = io.connect('http://localhost');
  }catch(e){
    // set status
  }

  if(socket!==undefined){
    // listen for outputs
    socket.on('output', function(data){
      if(data.length){
        for(var x=0;x<data.length;x++){
          var message = document.createElement('div');
          message.setAttribute('class', 'chat-message');
          message.textContent = data[x].name + " : " + data[x].message;
          messages.appendChild(message);
          messages.insertBefore(message, messages.lastChild);
        }
      }
    })

    //listen for a status
    socket.on('status', function(data){
      setStatus((typeof data === 'object')? data.message:data);
      if(data.clear === true){
        textArea.value = '';
      }
    })

    textArea.addEventListener('keydown', function(event){
      var self = this,
          name = chatName.value;
      if(event.which === 13 && event.shiftKey===false){
        socket.emit('input', {
          name: name,
          message: self.value
        });

        event.preventDefault();
      }
    });
  }

})();
