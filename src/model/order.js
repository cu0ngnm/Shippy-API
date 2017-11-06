import mysql from 'mysql';
import connection from '../db';

let Order = {

  GetByID:function(id, callback){
    return connection.query('SELECT * from `order` WHERE order_code = ?', id, callback);
  },

  GetWaiting:function(callback){
    return connection.query('SELECT * from `order` WHERE status_flg = 1 ORDER BY updatedAt DESC', callback);
  },

  CreateOrder:function(order, callback) {
    return connection.query('INSERT INTO `order` SET ?', order, callback);
  },

  CheckStatus:function(id, callback){
    return connection.query('SELECT status_flg from `order` WHERE order_code = ?', id, callback);
  },

  ReceiveOrder:function(id, orderUpdate, callback){
    return connection.query('UPDATE `order` SET ? WHERE order_code = ?', [orderUpdate, id], callback);
  }

};
module.exports = Order;
