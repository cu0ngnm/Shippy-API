import mysql from 'mysql';
import connection from '../db';

let Order = {

  GetByID:function(id, callback){
    return connection.query('SELECT * from `order` WHERE order_code = ?', id, callback);
  },

  GetWaiting:function(callback){
    return connection.query('select `order`.order_code, `order`.seller_phone, `order`.buyer_phone, `order`.shipper_phone, seller.seller_name, `order`.order_price, `order`.order_fee, `order`.order_description, `order`.category_id, '
    +'`order`.distance, `order`.estimated_time, `order`.from_name, `order`.to_name, `order`.image_url, `order`.status_flg, `order`.time_delivered, `order`.createdAt from `order` join `seller` on `order`.seller_phone = seller.seller_phone WHERE `order`.status_flg = 1 ORDER BY `order`.createdAt DESC', callback);
  },

  Create:function(order, callback) {
    return connection.query('INSERT INTO `order` SET ?', order, callback);
  },

  Update:function(id, orderUpdate, callback){
    return connection.query('UPDATE `order` SET ? WHERE order_code = ?', [orderUpdate, id], callback);
  },

  CheckStatus:function(id, callback){
    return connection.query('SELECT status_flg from `order` WHERE order_code = ?', id, callback);
  },

  Receive:function(id, orderUpdate, callback){
    return connection.query('UPDATE `order` SET ? WHERE order_code = ?', [orderUpdate, id], callback);
  },

  GetSellerHistory:function(sellerId, statusId, callback){
    if(statusId == 1 || statusId == 3){
      return connection.query('select `order`.order_code, `order`.seller_phone, `order`.buyer_phone, `order`.shipper_phone, seller.seller_name ,`order`.order_price, `order`.order_fee, `order`.order_description, `order`.category_id, ' +
      '`order`.distance, `order`.estimated_time, `order`.from_name, `order`.to_name, `order`.image_url, `order`.status_flg, `order`.time_delivered, `order`.createdAt from `order` join `seller` on `order`.seller_phone = seller.seller_phone WHERE `order`.seller_phone = ? and `order`.status_flg = ? ORDER BY `order`.createdAt DESC', [sellerId, statusId], callback);
    } else {
      return connection.query('select `order`.order_code, `order`.seller_phone, `order`.buyer_phone, `order`.shipper_phone, seller.seller_name , shipper.shipper_name, `order`.order_price, `order`.order_fee, `order`.order_description, `order`.category_id, ' +
      '`order`.distance, `order`.estimated_time, `order`.from_name, `order`.to_name, `order`.image_url, `order`.status_flg, `order`.time_delivered, `order`.createdAt from `order` join `seller` join shipper on `order`.seller_phone = seller.seller_phone and `order`.shipper_phone = shipper.shipper_phone WHERE `order`.seller_phone = ? and `order`.status_flg = ? ORDER BY `order`.createdAt DESC', [sellerId, statusId], callback);
    }

  },

  GetShipperHistory:function(shipperId, statusId, callback){
    return connection.query('select `order`.order_code, `order`.seller_phone, `order`.buyer_phone, `order`.shipper_phone, seller.seller_name , shipper.shipper_name, `order`.order_price, `order`.order_fee, `order`.order_description, `order`.category_id, ' +
    '`order`.distance, `order`.estimated_time, `order`.from_name, `order`.to_name, `order`.image_url, `order`.status_flg, `order`.time_delivered, `order`.createdAt from `order` join `seller` join shipper on `order`.seller_phone = seller.seller_phone and `order`.shipper_phone = shipper.shipper_phone WHERE `order`.shipper_phone = ? and `order`.status_flg = ? ORDER BY `order`.createdAt DESC', [shipperId, statusId], callback);
  },

  Finish:function(finish_order, id, callback){
    return connection.query('UPDATE `order` SET ? WHERE order_code = ?', [finish_order, id], callback);
  },

  Cancel:function(orderUpdate, id, callback){
    return connection.query('UPDATE `order` SET ? WHERE order_code = ?', [orderUpdate, id], callback);
  },

  GetNumberOfReceivingOrder:function(phone, callback){
    return connection.query('SELECT order_code from `order` WHERE shipper_phone = ? and status_flg = 2', phone, callback);
  },

  GetNumberOfCreatedOrder:function(phone, callback){
    return connection.query('SELECT order_code from `order` WHERE seller_phone = ? and status_flg = 1', phone, callback);
  },

};
module.exports = Order;
