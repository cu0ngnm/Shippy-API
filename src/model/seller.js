import mysql from 'mysql';
import connection from '../db';

let Seller = {

  getSellerByID:function(id, callback){
    return connection.query('SELECT * from seller WHERE seller_phone = ?', id, callback);
  },

  registerSeller:function(seller, callback) {
    return connection.query('INSERT INTO seller SET ?', seller, callback);
  },

  /*updateBuyer:function(id, Buyer, callback) {
    let buyer = {
      "buyer_name": Buyer.buyer_name,
      "buyer_email": Buyer.buyer_email
    }
    return connection.query('UPDATE buyer SET ? WHERE buyer_phone = ?', [buyer, id], callback);
  }*/

  login:function(seller_phone, callback) {
    return connection.query('SELECT * FROM seller WHERE seller_phone = ?', seller_phone, callback);
  }
};
module.exports = Seller;
