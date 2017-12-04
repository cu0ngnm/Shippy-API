import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import User from '../model/user';
import Seller from '../model/seller';
import Shipper from '../model/shipper';
import config from '../config';
import jwt from 'jsonwebtoken';
import verifyToken from '../middleware/verifyToken';
import constant from '../utilities/constant';
import bcrypt from'bcrypt';

const salt = bcrypt.genSaltSync(10);


export default({ config, db}) => {
  let api = Router();

  api.post('/user/login', (req, res) => {
    if(req.body.role == `seller`){
      Seller.GetById(req.body.phone, function(err, user_result){

        if(user_result.length > 0){
          User.Login(req.body.access_token, req.body.device_token, req.body.phone, function(err, result){

            if(!err){
              res.status(200).send({
                "code":200,
                "user":user_result,
                "message":"Login successful."
              });
            } else {
              res.status(400).send(err);
            }

          });
        } else if (user_result.length == 0) {

          let user = {
            "seller_phone": req.body.phone,
            "access_token": req.body.access_token,
            "device_token": req.body.device_token
          }
          Seller.Register(user , function(err, result){
            if(!err){
              res.status(201).send({
                "code":201,
                "message":"Register successful!"
              });
            } else {
              res.status(400).send(err);
            }
          });

        }

      });
    } else if (req.body.role == `shipper`) {
      Shipper.GetById(req.body.phone, function(err, user_result){

        if(user_result.length > 0){
          User.Login(req.body.access_token, req.body.device_token, req.body.phone, function(err, result){

            if(!err){
              res.status(200).send({
                "code":200,
                "user":user_result,
                "message":"Login successful."
              });
            } else {
              res.status(400).send(err);
            }

          });
        } else if (user_result.length == 0) {

          let user = {
            "shipper_phone": req.body.phone,
            "access_token": req.body.access_token,
            "device_token": req.body.device_token
          }
          Shipper.Register(user , function(err, result){
            if(!err){
              res.status(201).send({
                "code":201,
                "message":"Register successful!"
              });
            } else {
              res.status(400).send(err);
            }
          });

        }

      });
    }

  });

  api.post('/user/logout', (req, res) => {
    if (req.body.role == `seller`) {
      Seller.Logout(req.body.access_token, req.body.device_token, req.body.phone, function(err, result){
        if(!err){
          if(result.affectedRows == 0){
            res.status(200).send({
              "code":'USER_NOT_FOUND',
              "message":"Check your user phone"
            });
          } else {
            res.status(200).send({
              "code":200,
              "message":"Logout successful!"
            });
          }
        } else {
          res.status(400).send(err);
        }
      });
    } else if (req.body.role == `shipper`) {
      Shipper.Logout(req.body.access_token, req.body.device_token, req.body.phone, function(err, result){
        if(!err){
          if(result.affectedRows == 0){
            res.status(200).send({
              "code":'USER_NOT_FOUND',
              "message":"Check your user phone"
            });
          } else {
            res.status(200).send({
              "code":200,
              "message":"Logout successful!"
            });
          }
        } else {
          res.status(400).send(err);
        }
      });
    }
  });

  api.post('/user/update', (req, res) => {
    if (req.body.role == `seller`) {
      let user = {};
      if(!req.body.image_url){
        user = {
          "seller_name": req.body.user_name
        }
      } else {
        user = {
          "seller_name": req.body.user_name,
          "image_url": req.body.image_url
        }
      }
      console.log(user);
      Seller.Update(req.body.phone, user, function(err, result){
        console.log(result);
        if(!err){
          if(result.affectedRows == 0){
            res.status(200).send({
              "code":'USER_NOT_FOUND',
              "message":"Check your user phone"
            });
          } else {
            res.status(200).send({
              "code":200,
              "message":"Update successful!"
            });
          }
        } else {
          res.status(400).send(err);
        }
      });
    } else if (req.body.role == `shipper`) {
      let user = {};
      if(!req.body.image_url){
        user = {
          "shipper_name": req.body.user_name
        }
      } else {
        user = {
          "shipper_name": req.body.user_name,
          "image_url": req.body.image_url
        }
      }
      Shipper.Update(req.body.phone, user, function(err, result){
        if(!err){
          if(result.affectedRows == 0){
            res.status(200).send({
              "code":'USER_NOT_FOUND',
              "message":"Check your user phone"
            });
          } else {
            res.status(200).send({
              "code":200,
              "message":"Update successful!"
            });
          }
        } else {
          res.status(400).send(err);
        }
      });
    }
  });

  return api;
}
