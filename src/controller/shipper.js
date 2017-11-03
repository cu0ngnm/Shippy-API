import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Shipper from '../model/shipper';
import config from '../config';
import jwt from 'jsonwebtoken';
import verifyToken from '../middleware/verifyToken';
import constant from '../utilities/constant';
import bcrypt from'bcrypt';

const salt = bcrypt.genSaltSync(10);


export default({ config, db}) => {
  let api = Router();

  api.get('/shipper/:id', (req, res) => {
    Shipper.getByID(req.params.id, function(err, result){
                if(err) {
                  res.status(400).send({
                    "code":400,
                    "error":err
                  });
                } else {
                  res.status(200).send({
                    "code":200,
                    "shipper":result
                  });
                }
    });
  });

  // '/v1/shippy/shipper/register' - POST - add new record
  api.post('/shipper/register', (req, res) => {

    let hashPassword = bcrypt.hashSync(req.body.shipper_password, salt);

    let shipper = {
      "shipper_phone": req.body.shipper_phone,
      "shipper_name": req.body.shipper_name,
      "shipper_email": req.body.shipper_email,
      "shipper_password": hashPassword
    }
    Shipper.register(shipper, function(err, result){

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

  // '/v1/shippy/shipper/login' - POST
  api.post('/shipper/login', (req, res) => {

    Shipper.login(req.body.shipper_phone, function(err, result){

      if(result.length > 0){

        if(bcrypt.compareSync(req.body.shipper_password, result[0].shipper_password)){
          let token = jwt.sign({
            id: req.body.shipper_phone,
          }, constant.CONST.TOKEN_SECRET, {
            expiresIn: constant.CONST.TOKENTIME // 30 days
          });
          res.status(200).send({
            "code":200,
            "role": 'shipper',
            "shipper_phone":req.body.shipper_phone,
            "token":token
          });
        } else {
          res.status(200).send({
            "code":200,
            "message":"password dose not match"
          });
        }

      } else if (!result.length) {
        res.status(200).send({
          "code":200,
          "message":"phone dose not exists"
        });
      } else {
        res.status(400).send(err);
      }
    });
  });

  return api;
}
