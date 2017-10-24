import mysql from 'mysql';
import connection from '../db';

let Order = {

  getOrderByID:function(id, callback){
    return connection.query('SELECT * from `order` WHERE order_code = ?', id, callback);
  },

  createOrder:function(order, callback) {
    return connection.query('INSERT INTO `order` SET ?', order, callback);
  },

};
module.exports = Order;
