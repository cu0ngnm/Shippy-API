import mysql from 'mysql';
import connection from '../db';

let Shipper = {

    GetById:function(id, callback) {
      return connection.query('SELECT * from shipper WHERE shipper_phone = ?', id, callback);
    },

    Register:function(user, callback) {
      return connection.query('INSERT INTO shipper SET ?', user, callback);
    },

    Login:function(access_token, device_token, shipper_phone, callback) {
      return connection.query('UPDATE shipper SET access_token = ?, device_token = ? WHERE shipper_phone = ? ', [access_token, device_token, shipper_phone], callback);
    },

    Logout:function(access_token, device_token, shipper_phone, callback)  {
      return connection.query('UPDATE shipper SET access_token = ?, device_token = ? WHERE shipper_phone = ?', [access_token, device_token, shipper_phone], callback);
    },

    GetDeviceToken:function(phone, callback){
      return connection.query('SELECT device_token from shipper WHERE shipper_phone = ?', phone, callback);
    },

    Update:function(id, user, callback){
      return connection.query('UPDATE shipper SET ? WHERE shipper_phone = ?', [user, id], callback);
    }

};
module.exports = Shipper;
