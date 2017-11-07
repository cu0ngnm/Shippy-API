import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Seller from '../model/seller';
import config from '../config';
import jwt from 'jsonwebtoken';
import verifyToken from '../middleware/verifyToken';
import constant from '../utilities/constant';
import bcrypt from'bcrypt';

const salt = bcrypt.genSaltSync(10);


export default({ config, db}) => {
  let api = Router();

  api.get('/seller/:id', (req, res) => {
    Seller.GetByID(req.params.id, function(err, result){

      if(!err){
        if(result.length > 0){
          res.status(200).send({
            "code":200,
            "seller":result
          });
        } else if (!result.length) {
          res.status(200).send({
            "code":200,
            "message":"phone does not exists"
          });
        }
      } else {
       res.status(400).send({
         "code":400,
         "error":err
       });
     }
    });
  });

  // '/v1/shippy/seller/register' - POST - add new record
  api.post('/seller/register', (req, res) => {

    let hashPassword = bcrypt.hashSync(req.body.seller_password, salt);

    let seller = {
      "seller_phone": req.body.seller_phone,
      "seller_name": req.body.seller_name,
      "seller_email": req.body.seller_email,
      "seller_password": hashPassword
    }
    Seller.Register(seller, function(err, result){

      if(!err){
        res.status(201).send({
          "code":201,
          "message":"Register successful."
        });
      } else if(err.code == 'ER_DUP_ENTRY'){
        res.status(200).send({
          "code":200,
          "message":"Phone or email already exists.",
          "result": err
        });
      } else {
        res.status(400).send(err);
      }
    });
  });

  // '/v1/shippy/seller/login' - POST
  api.post('/seller/login', (req, res) => {

    Seller.Login(req.body.seller_phone, function(err, result){

      if(!err){
        if(result.length > 0){
          if(bcrypt.compareSync(req.body.seller_password, result[0].seller_password)){
            let token = jwt.sign({
              id: req.body.seller_phone,
            }, constant.TOKEN_SECRET, {
              expiresIn: constant.TOKENTIME // 30 days
            });
            res.status(200).send({
              "code":200,
              "role": 'seller',
              "seller_phone":req.body.seller_phone,
              "token":token
            });
          } else {
            res.status(200).send({
              "code":200,
              "message":"password does not match"
            });
          }

        } else if (!result.length) {
          res.status(200).send({
            "code":200,
            "message":"phone does not exists"
          });
        }
      } else {
       res.status(400).send(err);
     }
    });
  });

  api.post('/seller/device_token', (req, res) => {

    if(!req.body.device_token){
      res.status(200).send({
        "code":'DEVICE_TOKEN_NULL',
        "message":"check your device_token"
      });
    } else if (!req.body.seller_phone) {
      res.status(200).send({
        "code":'SELLER_PHONE_NULL',
        "message":"check your seller_phone"
      });
    } else {
      Seller.UpdateDeviceToken(req.body.device_token, req.body.seller_phone, function(err, result){

        if(!result.length){
          res.status(200).send({
            "code":'SELLER_PHONE_NOT_FOUND',
            "message":"check your seller_phone"
          });
        } else {
          if(!err){
            res.status(200).send({
              "code":200,
              "message":"device_token update successful"
            });
          } else {
            res.status(400).send(err);
          }
        }
      });
    }
  });

  return api;
}
