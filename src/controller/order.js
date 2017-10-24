import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Order from '../model/order';
import config from '../config';


export default({ config, db}) => {
  let api = Router();

  api.get('/order/:id', (req, res) => {
    Seller.getSellerByID(req.params.id, function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
    });
  });

  // '/v1/shippy/order/create' - POST - add new record
  api.post('/order/create', (req, res) => {
    let response = [];

    let order = {
      "order_code": req.body.order_code,
      "seller_phone": req.body.seller_phone,
      "buyer_phone": req.body.buyer_phone,
      "category_id": req.body.category_id,
      "order_price": req.body.order_price,
      "order_fee": req.body.order_fee
    }
    Order.createOrder(order, function(err, result){
      if(!err){
        if(result.affectedRows != 0) {
          response.push({'result' : 'add success'});
        } else {
          response.push({'msg' : 'no result found'});
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
      } else {
        res.status(400).send(err);
      }
    });
  });
  return api;
}
