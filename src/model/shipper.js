import mysql from 'mysql';
import connection from '../db';

let Shipper = {

  getByID:function(id, callback){
    return connection.query('SELECT * from shipper WHERE shipper_phone = ?', id, callback);
  },

  register:function(shipper, callback) {
    return connection.query('INSERT INTO shipper SET ?', shipper, callback);
  },

  login:function(shipper_phone, callback) {
    return connection.query('SELECT * FROM shipper WHERE shipper_phone = ?', shipper_phone, callback);
  }
};
module.exports = Shipper;
