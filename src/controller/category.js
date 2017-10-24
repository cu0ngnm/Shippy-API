import mysql from 'mysql';
import {  Router } from 'express';
import bodyParser from 'body-parser';
import Category from '../model/category';
import config from '../config';
import verifyToken from '../middleware/verifyToken';

export default({ config, db}) => {
  let api = Router();

  api.get('/category/', verifyToken, (req, res) => {
    Category.getAllCategory(function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
    });
  });
  return api;
}
