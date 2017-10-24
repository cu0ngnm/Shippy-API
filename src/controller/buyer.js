import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Buyer from '../model/buyer';

export default({ config, db}) => {
  let api = Router();

  api.get('/buyer/:id', (req, res) => {
    Buyer.getAllBuyers(req.params.id, function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
    });
  });

  // '/v1/shippy/buyer/add' - POST - add new record
  api.post('/buyer/add', (req, res) => {
    let response = [];
    Buyer.addBuyer(req.body, function(err, result){
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

  // '/v1/shippy/buyer/update/:id' - PUT - update an existing record
  api.put('/buyer/update/:id', (req, res) => {
    let response = [];
    Buyer.updateBuyer(req.params.id, req.body, function(err, result){
      if(!err){
        if(result.affectedRows != 0) {
          response.push({ result: 'update success' });
        } else {
          response.push({ msg : 'no result found' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
      } else {
        res.status(400).send(err);
      }
      /*if (err) {
        res.send(err);
      }
      res.json({ message: 'buyer info updated' });*/
    });
  });

  return api;
}
