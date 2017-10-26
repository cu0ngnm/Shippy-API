import express from 'express';
import socket from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import logger from 'morgan';

import config from './config';
import routes from './routes';

let app = express();

app.use(logger('dev'));
//app.server = http.createServer(app);
const server = http.createServer(app);

// middleware
app.use(bodyParser.json({   // parse application.json
  limit: config.bodyLimit
}));

// socket.io
//export const io = socket.listen(app.server);
const io = socket.listen(server);
require('./socket')(io);

app.get('/', function (req, res) {
  res.send('Welcome to Shippy API !');
});

// api routes v1
app.use('/v1', routes);

server.listen(config.port);
console.log(`Started on port ${server.address().port}`);

export default app;
