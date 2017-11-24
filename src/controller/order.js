import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import FCM from 'fcm-push';
import validate from 'express-validation';
import process from 'process';
import Multer from 'multer';
import Storage from '@google-cloud/storage';
const format = require('util').format;

import Order from '../model/order';
import User from '../model/user';
import Seller from '../model/seller';
import config from '../config';
import verifyToken from '../middleware/verifyToken';
import constant from '../utilities/constant';
import validations from '../validation/order';

const fcm = new FCM(constant.FCM_SERVER_KEY);

// Instantiate a storage client
const storage = Storage({
  projectId: 'shippy-184715',
  keyFilename: './gg_cloud_service.json'
});

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

// A bucket is a container for objects (files).
const bucket = storage.bucket(constant.BUCKET_NAME);

export default({ config, db}) => {
  let api = Router();

  api.get('/order/:id', (req, res) => {
    Order.GetByID(req.params.id, function(err, result){
                if(err) {
                  res.status(400).send({
                    "code":400,
                    "error":err
                  });
                } else if (!result.length){
                  res.status(200).send({
                    "code": 'ORDER_NOT_FOUND',
                    "message": 'Can not find this order.'
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
                    "code": 400,
                    "error": err
                  });
                } else if (!result.length){
                  res.status(200).send({
                    "code": 'ORDER_NOT_FOUND',
                    "message": 'Has no order in watting.'
                  });
                } else {
                  res.status(200).send({
                    "code": 200,
                    "order": result
                  });
                }
    });
  });

  // '/v1/shippy/order/receive_order/'
  api.post('/order/receive_order/', (req, res) => {

    Order.CheckStatus(req.body.order_code, function(err, statusResult){
      console.log(statusResult);
      if(!statusResult.length){
        res.status(200).send({
          "code": 'ORDER_CODE_NOT_FOUND',
          "message": 'Can not find this order.'
        });
      } else {
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

              User.GetDeviceToken(req.body.seller_phone, function(err, token){
                if(!err){
                  if(!token.length){
                    console.log('device_token not found. Can not sent notification');
                  } else {
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
                    fcm.send(message, function(err, response){
                      if (err) {
                        console.log("Something has gone wrong: ", err);
                      } else {
                        console.log("Successfully sent to user " + req.body.seller_phone + " with response: ", response);
                      }
                    });
                  }

                } else {
                  console.log(err);
                }
              });
            } else {
              res.status(400).send(err);
            }

          });

        } else if (statusResult[0].status_flg == constant.RECIEVED_ORDER || statusResult[0].status_flg == constant.FINISHED_ORDER){
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
      }
    });

  });

  // '/v1/shippy/order/create' - POST - add new record
  api.post('/order/create', (req, res) => {

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
      "to_latitude": req.body.to_latitude,
      "from_name": req.body.from_name,
      "to_name": req.body.to_name,
      "distance": req.body.distance,
      "estimated_time": req.body.estimated_time
    }
    Order.Create(order, function(err, result){
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

  api.get('/order/history/:roll/:phone/:statusId', validate(validations.getHistory), (req, res) => {

    if(req.params.roll == 'seller'){
      Order.GetSellerHistory(req.params.phone, req.params.statusId, function(err, result){
                  if(err) {
                    res.status(400).send({
                      "code":400,
                      "error":err
                    });
                  } else if (!result.length){
                    res.status(200).send({
                      "code": 'ORDER_NOT_FOUND',
                      "message": 'Can not find this order.'
                    });
                  } else {
                    res.status(200).send({
                      "code":200,
                      "order":result
                    });
                  }
      });
    } else if (req.params.roll == 'shipper') {
      Order.GetShipperHistory(req.params.phone, req.params.statusId, function(err, result){
                  if(err) {
                    res.status(400).send({
                      "code":400,
                      "error":err
                    });
                  } else if (!result.length){
                    res.status(200).send({
                      "code": 'ORDER_NOT_FOUND',
                      "message": 'Can not find this order.'
                    });
                  } else {
                    res.status(200).send({
                      "code":200,
                      "order":result
                    });
                  }
      });
    }
  });

  api.post('/order/finish', (req, res) => {

    let finish_order = {
      "time_delivered": req.body.time_delivered,
      "status_flg": constant.FINISHED_ORDER
    }
    Order.Finish(finish_order, req.body.order_code, function(err, result){

      if(result.affectedRows == 0){
        res.status(200).send({
          "code": 'ORDER_CODE_NOT_FOUND',
          "message": 'Can not find this order.'
        });
      } else if(!err){
        res.status(200).send({
          "code":200,
          "message":"Order finish Successfully!"
        });

        Seller.GetDeviceToken(req.body.seller_phone, function(err, token){
          if(!err){
            if(!token.length){
              console.log('device_token not found. Can not sent notification');
            } else {
              console.log(token);
              let message = {
                to: token[0].device_token, // required fill with device token or topics
                //collapse_key: 'your_collapse_key',
                //data: {
                //    your_custom_data_key: 'your_custom_data_value'
                //},
                notification: {
                    //title: 'Shippy',
                    body: 'Đơn hàng mã ' + req.body.order_code +' đã được giao thành công!'
                }
              };
              fcm.send(message, function(err, response){
                if (err) {
                  console.log("Something has gone wrong: ", err);
                } else {
                  console.log("Successfully sent to user " + req.body.seller_phone + " with response: ", response);
                }
              });
            }

          } else {
            console.log(err);
          }
        });

      } else {
        res.status(400).send(err);
      }

    });
  });

  api.post('/upload', multer.single('file'), (req, res, next) => {

    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
      res.status(200).send(publicUrl);
    });

    blobStream.end(req.file.buffer);
  });

  // '/v1/shippy/order/cancel'
  api.post('/order/cancel/', (req, res) => {

    Order.CheckStatus(req.body.order_code, function(err, statusResult){
      console.log(statusResult);
      if(!statusResult.length){
        res.status(200).send({
          "code": 'ORDER_CODE_NOT_FOUND',
          "message": 'Can not find this order.'
        });
      } else {
        if(statusResult[0].status_flg == constant.WAITTING_ORDER){

          let orderUpdate = {
            "shipper_phone": '',
            "status_flg": req.body.status_flg
          }
          // Order.Cancel(req.body.order_code, orderUpdate, function(err, result){
          //   if(!err){
          //     res.status(200).send({
          //       "code":200,
          //       "message":"Order finish Successfully!"
          //     });
          //   } else {
          //     res.status(400).send(err);
          //   }
          //
          // }


        } else if (statusResult[0].status_flg == constant.RECIEVED_ORDER || statusResult[0].status_flg == constant.FINISHED_ORDER){
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
          res.status(400).send(err);
        }
      }
    });

  });

  return api;
}
