import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Address from '../model/address';

export default({ config, db}) => {
  let api = Router();

  // '/v1/shippy/address/:id'
  api.get('/address/:id', (req, res) => {
    Address.getAll(req.params.id, function(err, result){
      if(err) {
        res.status(400).send({
          "code":400,
          "error":err
        });
      } else {
        res.status(200).send({
          "code":200,
          "buyer":result
        });
      }
    });
  });

  // '/v1/shippy/address/add' - POST - add new record
  api.post('/address/add', (req, res) => {
    let address = {
      "user_phone": req.body.user_phone,
      "user_address": req.body.user_address
    }
    Address.add(address, function(err, result){
      if(!err){
        res.status(201).send({
          "code":201,
          "message":"address add successful!"
        });
      } else {
        res.status(400).send(err);
      }
    });
  });

  return api;
}
