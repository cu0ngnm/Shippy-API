import mysql from 'mysql'

/*let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "shippy_local"
});*/

// let connection = mysql.createConnection({
//   host: 'shippy.mysql.database.azure.com',
//   user: 'cuongnm@shippy',
//   password: 'Cuong1821995',
//   database: 'shippy',
//   port: 3306,
//   ssl: true
// });

let connection = mysql.createConnection({
  host: "shippy.cum65ahmr9e4.us-west-2.rds.amazonaws.com",
  user: "shippy",
  password: "12345678",
  database: "Shippy",
  port: 3306,
  ssl: true
});

module.exports = connection;
