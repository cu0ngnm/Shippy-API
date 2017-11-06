import mysql from 'mysql';
import connection from '../db';

let Shipper = {

  GetByID:function(id, callback){
    return connection.query('SELECT * from shipper WHERE shipper_phone = ?', id, callback);
  },

  Register:function(shipper, callback) {
    return connection.query('INSERT INTO shipper SET ?', shipper, callback);
  },

  Login:function(shipper_phone, callback) {
    return connection.query('SELECT * FROM shipper WHERE shipper_phone = ?', shipper_phone, callback);
  },

  UpdateDeviceToken:function(device_token, shipper_phone, callback){
    return connection.query('UPDATE shipper SET device_token = ? WHERE shipper_phone = ?', [device_token, shipper_phone], callback);
  },

};
module.exports = Shipper;
