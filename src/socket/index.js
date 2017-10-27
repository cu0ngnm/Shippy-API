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
    var accountID = "";
    var data = 'cuongnm';
    console.log('CLIENT CONNECTED: ' + client_ip);
    console.log('CLIENT id: ' + socket.id);

    socket.on('nhandon', function (jsonObject) {
        console.log(jsonObject.sellerInfo.name);
        socket.emit('nhanthanhcong', data);
    });



  });

}
