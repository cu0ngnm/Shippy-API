import mysql from 'mysql';
import connection from '../db';

let Buyer = {

  getAllBuyers:function(id, callback){
    return connection.query('SELECT * from buyer WHERE buyer_phone = ?', id, callback);
  },

  addBuyer:function(Buyer, callback) {
    let buyer = {
      "buyer_phone": Buyer.buyer_phone,
      "buyer_name": Buyer.buyer_name,
      "buyer_email": Buyer.buyer_email
    }
    return connection.query('INSERT INTO buyer SET ?', buyer, callback);
  },

  updateBuyer:function(id, Buyer, callback) {
    let buyer = {
      "buyer_name": Buyer.buyer_name,
      "buyer_email": Buyer.buyer_email
    }
    return connection.query('UPDATE buyer SET ? WHERE buyer_phone = ?', [buyer, id], callback);
  }

};
module.exports = Buyer;
