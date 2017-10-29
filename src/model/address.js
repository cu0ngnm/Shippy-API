import mysql from 'mysql';
import connection from '../db';

let Address = {

  getAll:function(id, callback){
    return connection.query('SELECT * from address', callback);
  },

  add:function(address, callback) {
    return connection.query('INSERT INTO address SET ?', address, callback);
  }

};
module.exports = Address;
