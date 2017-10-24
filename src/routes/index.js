import express from 'express';
import config from '../config';
import middleware from '../middleware';
import connection from '../db';

import buyer from '../controller/buyer';
import seller from '../controller/seller';
import order from '../controller/order';
import category from '../controller/category';

let router = express();

//connect to db
connection.connect(db => {

  //internal middleware
  router.use(middleware({ config, db }));

  //api routes v1 (/v1/shippy)
  router.use('/shippy', buyer({ config, db }));
  router.use('/shippy', seller({ config, db }));
  router.use('/shippy', order({ config, db }));
  router.use('/shippy', category({ config, db }));

});

export default router;
