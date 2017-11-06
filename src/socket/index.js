import Seller from '../model/seller';

module.exports = (io) => {

  /*io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });*/

  io.sockets.on('connection', function (socket) {
    var client_ip = socket.request.connection.remoteAddress;
    var idSave = socket.id;
    var data = 'cuongnm';
    console.log('CLIENT CONNECTED: ' + client_ip);
    console.log('CLIENT id: ' + socket.id);

    socket.on('login', function (user) {
      console.log(user);
      Seller.UpdateSocketID(user, socket.id, function(err, result){
                  if(err) {
                    socket.emit('savesocketfail', err);
                  } else {
                    socket.emit('savesocketsuccess', "thanhcong");
                  }
      });
    });


    io.to('XBbr7C-hgRpdv5rbAAAA').emit('event', 'emit to socket ' + socket.id);

    socket.on('disconnect', function() {
      console.log('CLIENT id: ' + socket.id + ' disconnect');
   });

  });

}


//io.to(socket.id).emit("event", data);  send data to a specific socket
