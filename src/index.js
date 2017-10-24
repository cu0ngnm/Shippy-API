import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import logger from 'morgan';

import config from './config';
import routes from './routes';

let app = express();
app.use(logger('dev'));

app.server = http.createServer(app);

// middleware

//parse application.json
app.use(bodyParser.json({
  limit: config.bodyLimit
}));

// passport config

// api routes v1
app.use('/v1', routes);

app.server.listen(config.port);
console.log(`Started on port ${app.server.address().port}`);

export default app;
