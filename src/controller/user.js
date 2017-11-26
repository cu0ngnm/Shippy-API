import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import User from '../model/user';
import config from '../config';
import constant from '../utilities/constant';

const salt = bcrypt.genSaltSync(10);


export default({ config, db}) => {
  let api = Router();

  api.post('/user/login', (req, res) => {
    User.GetById(req.body.account_id, function(err, result){

      if(result.length > 0){
        User.Login(req.body.access_token, req.body.device_token, req.body.account_id, function(err, result){

          if(!err){
            res.status(200).send({
              "code":200,
              "message":"Login successful."
            });
          } else {
            res.status(400).send(err);
          }

        });
      } else if (result.length == 0) {

        let user = {
          "account_id": req.body.account_id,
          "phone": req.body.phone,
          "access_token": req.body.access_token,
          "device_token": req.body.device_token
        }
        User.Register(user , function(err, result){
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
  });

  api.post('/user/logout', (req, res) => {
    console.log('fcm token: ' + req.body.device_token);
    if (!req.body.account_id) {
      res.status(200).send({
        "code":'USER_NULL',
        "message":"account_id can be null"
      });
    } else {
      User.Logout(req.body.access_token, req.body.device_token, req.body.account_id, function(err, result){
        if(!err){
          if(result.affectedRows == 0){
            res.status(200).send({
              "code":'USER_NOT_FOUND',
              "message":"Check your account_id"
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

  return api;
}
