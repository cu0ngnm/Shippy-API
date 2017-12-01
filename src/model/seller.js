import mysql from 'mysql';
import connection from '../db';

let Seller = {

  GetById:function(id, callback) {
    return connection.query('SELECT * from seller WHERE seller_phone = ?', id, callback);
  },

  Register:function(user, callback) {
    return connection.query('INSERT INTO seller SET ?', user, callback);
  },

  Login:function(access_token, device_token, seller_phone, callback) {
    return connection.query('UPDATE seller SET access_token = ?, device_token = ? WHERE seller_phone = ? ', [access_token, device_token, seller_phone], callback);
  },

  Logout:function(access_token, device_token, seller_phone, callback)  {
    return connection.query('UPDATE seller SET access_token = ?, device_token = ? WHERE seller_phone = ?', [access_token, device_token, seller_phone], callback);
  },

  GetDeviceToken:function(phone, callback){
    return connection.query('SELECT device_token from seller WHERE seller_phone = ?', phone, callback);
  },

  Update:function(id, user, callback){
    return connection.query('UPDATE seller SET ? WHERE seller_phone = ?', [user, id], callback);
  }

};
module.exports = Seller;
