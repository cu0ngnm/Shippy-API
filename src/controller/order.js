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
import Seller from '../model/seller';
import Shipper from '../model/shipper';
import config from '../config';
//import verifyToken from '../middleware/verifyToken';
import verifyToken from '../middleware/revifyFBAccessToken';
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

  api.get('/order/:id',verifyToken, (req, res) => {
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

  api.post('/order/update/', (req, res) => {

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
            "buyer_phone": req.body.buyer_phone,
            "category_id": req.body.category_id,
            "order_price": req.body.order_price,
            "order_fee": req.body.order_fee,
            "order_description": req.body.order_description,
          }

          Order.Update(req.body.order_code, orderUpdate, function(err, result){
            if(!err){
              res.status(200).send({
                "code":200,
                "message":"Cập nhật thành công!"
              });
            } else {
              res.status(400).send(err);
            }

          });

        } else if (statusResult[0].status_flg == constant.RECIEVED_ORDER || statusResult[0].status_flg == constant.FINISHED_ORDER || statusResult[0].status_flg == constant.CANCELED_ORDER){
          res.status(200).send({
            "code":200,
            "message":"Không thể cập nhật đơn này!"
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
        Order.GetNumberOfReceivingOrder(req.body.shipper_phone, function(err, result){
          console.log('leng: ' + result.length);
          if(err) {
            res.status(400).send({
              "code": 400,
              "error": err
            });
          } else if (result.length > 3){
            res.status(200).send({
              "code": '200',
              "message": 'Đạt đến giới hạn nhận đơn!'
            });
          } else {
            if(statusResult[0].status_flg == constant.WAITTING_ORDER){

              let orderUpdate = {
                "shipper_phone" : req.body.shipper_phone,
                "status_flg" : constant.RECIEVED_ORDER
              }

              Order.Receive(req.body.order_code, orderUpdate, function(err, result){
                if(!err){
                  res.status(200).send({
                    "code":200,
                    "message":"Nhận đơn thành công!"
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
    //GetNumberOfCreatedOrder
    Order.GetNumberOfCreatedOrder(req.body.seller_phone, function(err, result){
      if(err){
        res.status(400).send(err);
      } else if (result.length > 10){
        res.status(200).send({
          "code": '200',
          "message": 'Đạt đến giới hạn tạo đơn!'
        });
      } else {
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
      }
    });
  });

  api.get('/order/history/:role/:phone/:statusId', (req, res) => {

    if(req.params.role == 'seller'){
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
    } else if (req.params.role == 'shipper') {
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
    Order.CheckStatus(req.body.order_code, function(err, statusResult){
      if(statusResult.affectedRows == 0){
        res.status(200).send({
          "code": 'ORDER_CODE_NOT_FOUND',
          "message": 'Can not find this order.'
        });
      } else if (statusResult[0].status_flg == constant.RECIEVED_ORDER) {
        let finish_order = {
          "time_delivered": req.body.time_delivered,
          "status_flg": constant.FINISHED_ORDER
        }
        Order.Finish(finish_order, req.body.order_code, function(err, result){
            if(!err){
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
                        body: 'Đơn hàng mã ' + req.body.order_code +' đã được giao thành công lúc: ' + req.body.time_delivered
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
      } else {
        res.status(200).send({
          "code":200,
          "message":"Bạn không thể hoàn tất đơn hàng này!"
        });
      }
    });
  });

  api.post('/upload', multer.single('file'), (req, res, next) => {

    // function decodeBase64Image(dataString) {
    //   var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    //     response = {};
    //
    //   if (matches.length !== 3) {
    //     return new Error('Invalid input string');
    //   }
    //
    //   response.type = matches[1];
    //   response.data = new Buffer(matches[2], 'base64');
    //
    //   return response;
    // }
    //
    // if (!req.file) {
    //   res.status(400).send('No file uploaded.');
    //   return;
    // }

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
            "shipper_phone": 'NULL',
            "status_flg": constant.CANCELED_ORDER
          }
          Order.Cancel(orderUpdate, req.body.order_code, function(err, result){
            if(!err){
              res.status(200).send({
                "code":200,
                "message":"Order Cancel Successful!"
              });

            } else {
              res.status(400).send(err);
            }

          });


        } else if (statusResult[0].status_flg == constant.RECIEVED_ORDER){
          if(req.body.role == 'seller'){

            let status_flg = "";

            if(req.body.action == 'refresh'){
              status_flg = constant.WAITTING_ORDER
            } else {
              status_flg = constant.CANCELED_ORDER
            }
            console.log(status_flg);
            let orderUpdate = {
              "shipper_phone": 'NULL',
              "status_flg": status_flg
            }

            Order.Cancel(orderUpdate, req.body.order_code, function(err, result){
              if(!err){
                res.status(200).send({
                  "code":200,
                  "message":"Order Cancel/Refuse Successful!"
                });

                Shipper.GetDeviceToken(req.body.shipper_phone, function(err, token){
                  if(!err){
                    console.log(token);
                    if(!token.length){
                      console.log('device_token not found. Can not sent notification');
                    } else {
                      let message = {
                        to: token[0].device_token, // required fill with device token or topics
                        //collapse_key: 'your_collapse_key',
                        //data: {
                        //    your_custom_data_key: 'your_custom_data_value'
                        //},
                        notification: {
                            //title: 'Shippy',
                            body: 'Đơn hàng mã ' + req.body.order_code +' đã bị hủy bởi seller!'
                        }
                      };
                      fcm.send(message, function(err, response){
                        if (err) {
                          console.log("Something has gone wrong: ", err);
                        } else {
                          console.log("Successfully sent to user " + req.body.shipper_phone + " with response: ", response);
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


          } else if (req.body.role == 'shipper') {

            let orderUpdate = {
              "shipper_phone": 'NULL',
              "status_flg": constant.WAITTING_ORDER
            }

            Order.Cancel(orderUpdate, req.body.order_code, function(err, result){
              if(!err){
                res.status(200).send({
                  "code":200,
                  "message":"Order Cancel Successful!"
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
                            body: 'Đơn hàng mã ' + req.body.order_code +' đã bị hủy bởi shipper! Đơn hàng này sẽ được chuyển về trạng thái chờ!'
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
          }

          // res.status(200).send({
          //   "code":200,
          //   "message":"Đơn hàng đã có người nhận!"
          // });
        } else if (statusResult[0].status_flg == constant.CANCELED_ORDER){
          res.status(200).send({
            "code":200,
            "message":"Đơn hàng này đã bị hủy rồi!"
          });
        } else if (statusResult[0].status_flg == constant.FINISHED_ORDER) {
          res.status(200).send({
            "code":200,
            "message":"Đơn hàng này đã hoàn thành rồi!"
          });
        } else {
          res.status(400).send(err);
        }
      }
    });

  });

  return api;
}
