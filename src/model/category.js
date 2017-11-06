import mysql from 'mysql';
import connection from '../db';

let Category = {

  GetAll:function(callback){
    return connection.query('SELECT * from category', callback);
  }

};
module.exports = Category;
