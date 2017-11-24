import mysql from 'mysql';
import connection from '../db';

let User = {


  GetById:function(id, callback) {
    return connection.query('SELECT * from user WHERE account_id = ?', id, callback);
  },

  Register:function(user, callback) {
    return connection.query('INSERT INTO user SET ?', user, callback);
  },

  Login:function(access_token, device_token, account_id, callback) {
    return connection.query('UPDATE user SET access_token = ? WHERE account_id = ? ', [access_token, device_token, account_id], callback);
  }

};
module.exports = User;
