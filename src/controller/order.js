import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Order from '../model/order';
import Seller from '../model/seller';
import config from '../config';
import verifyToken from '../middleware/verifyToken';
import constant from '../utilities/constant';
import FCM from 'fcm-push';

const fcm = new FCM(constant.FCM_SERVER_KEY);

export default({ config, db}) => {
  let api = Router();

  api.get('/order/:id', (req, res) => {
    Order.GetByID(req.params.id, function(err, result){
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
    Order.GetWaiting(function(err, result){
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

  // '/v1/shippy/order/receive_order/'
  api.post('/order/receive_order/', (req, res) => {

    Order.CheckStatus(req.body.order_code, function(err, statusResult){
      if(statusResult[0].status_flg == constant.WAITTING_ORDER){

        let orderUpdate = {
          "shipper_phone" : req.body.shipper_phone,
          "status_flg" : req.body.status_flg
        }

        Order.ReceiveOrder(req.body.order_code, orderUpdate, function(err, result){
          if(!err){
            res.status(200).send({
              "code":200,
              "message":"Nhận đơn thành công!"
            });

            Seller.GetDeviceToken(req.body.seller_phone, function(err, token){
              if(!err){
                console.log(token);
                let message = {
                  to: token[0].device_token, // required fill with device token or topics
                  //collapse_key: 'your_collapse_key',
                  //data: {
                  //    your_custom_data_key: 'your_custom_data_value'
                  //},
                  notification: {
                      //title: 'Shippy',
                      body: 'Đơn hàng mã ' + req.body.order_code +' đã được nhận. Shipper sẽ liên lạc với bạn trong ít phút nữa!'
                  }
                };
                console.log(message);
                fcm.send(message, function(err, response){
                  if (err) {
                    console.log("Something has gone wrong: ", err);
                  } else {
                    console.log("Successfully sent to user " + req.body.seller_phone + " with response: ", response);
                  }
                });
              } else {
                console.log(err);
              }
            });
          } else {
            res.status(400).send(err);
          }

        });

      } else if (statusResult[0].status_flg == constant.RECIEVED_ORDER){
        res.status(200).send({
          "code":200,
          "message":"Đơn hàng đã có người nhận!"
        });
      } else if (statusResult[0].status_flg == constant.CANCELED_ORDER){
        res.status(200).send({
          "code":200,
          "message":"Đơn hàng đã bị huỷ bởi seller!"
        });
      } else {
        res.status(200).send({
          "code":200,
          "message": err
        });
      }
    });
  });

  // '/v1/shippy/order/create' - POST - add new record
  api.post('/order/create', verifyToken, (req, res) => {

    let order = {
      "seller_phone": req.body.seller_phone,
      "buyer_phone": req.body.buyer_phone,
      "category_id": req.body.category_id,
      "order_price": req.body.order_price,
      "order_fee": req.body.order_fee,
      "order_description": req.body.order_description,
      "from_longitude": req.body.from_longitude,
      "from_latitude": req.body.from_latitude,
      "to_longitude": req.body.to_longitude,
      "to_latitude": req.body.to_latitude
    }
    Order.CreateOrder(order, function(err, result){
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
