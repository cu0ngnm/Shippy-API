import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Order from '../model/order';
import config from '../config';


export default({ config, db}) => {
  let api = Router();

  api.get('/order/:id', (req, res) => {
    Order.getOrderByID(req.params.id, function(err, result){
                if(err) {
                  res.status(400).send({
                    "code":400,
                    "error":err
                  });
                } else {
                  res.status(200).send({
                    "code":200,
                    "order":result
                  });
                }
    });
  });


  api.get('/order/', (req, res) => {
    Order.getAllOrder(function(err, result){
                if(err) {
                  res.status(400).send({
                    "code":400,
                    "error":err
                  });
                } else {
                  res.status(200).send({
                    "code":200,
                    "order":result
                  });
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
        res.status(201).send({
          "code":201,
          "message":"Order created!"
        });
      } else {
        res.status(400).send(err);
      }
    });
  });
  return api;
}
