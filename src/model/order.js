import mysql from 'mysql';
import connection from '../db';

let Order = {

  GetByID:function(id, callback){
    return connection.query('SELECT * from `order` WHERE order_code = ?', id, callback);
  },

  GetWaiting:function(callback){
    return connection.query('SELECT * from `order` WHERE status_flg = 1 ORDER BY updatedAt DESC', callback);
  },

  Create:function(order, callback) {
    return connection.query('INSERT INTO `order` SET ?', order, callback);
  },

  CheckStatus:function(id, callback){
    return connection.query('SELECT status_flg from `order` WHERE order_code = ?', id, callback);
  },

  ReceiveOrder:function(id, orderUpdate, callback){
    return connection.query('UPDATE `order` SET ? WHERE order_code = ?', [orderUpdate, id], callback);
  },

  GetSellerHistory:function(sellerId, statusId, callback){
    return connection.query('SELECT * from `order` WHERE seller_phone = ? and status_flg = ?', [sellerId, statusId], callback);
  },

  GetShipperHistory:function(shipperId, statusId, callback){
    return connection.query('SELECT * from `order` WHERE shipper_phone = ? and status_flg = ?', [shipperId, statusId], callback);
  }

};
module.exports = Order;
