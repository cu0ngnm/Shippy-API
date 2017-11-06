import mysql from 'mysql';
import connection from '../db';

let Seller = {

  GetByID:function(id, callback){
    return connection.query('SELECT * from seller WHERE seller_phone = ?', id, callback);
  },

  Register:function(seller, callback) {
    return connection.query('INSERT INTO seller SET ?', seller, callback);
  },

  GetDeviceToken:function(seller_phone, callback){
    return connection.query('SELECT device_token from seller WHERE seller_phone = ?', seller_phone, callback);
  },

  Login:function(seller_phone, callback) {
    return connection.query('SELECT * FROM seller WHERE seller_phone = ?', seller_phone, callback);
  },

  UpdateDeviceToken:function(device_token, seller_phone, callback){
    return connection.query('UPDATE seller SET device_token = ? WHERE seller_phone = ?', [device_token, seller_phone], callback);
  },

  UpdateSocketID:function(seller_phone, socket_id, callback){
    return connection.query('UPDATE seller SET socket_id = ? WHERE seller_phone = ?', [socket_id, seller_phone], callback);
  }


    /*updateBuyer:function(id, Buyer, callback) {
      let buyer = {
        "buyer_name": Buyer.buyer_name,
        "buyer_email": Buyer.buyer_email
      }
      return connection.query('UPDATE buyer SET ? WHERE buyer_phone = ?', [buyer, id], callback);
    }*/

};
module.exports = Seller;
