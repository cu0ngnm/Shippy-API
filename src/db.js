import mysql from 'mysql'

/*let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "shippy_local"
});*/

let connection = mysql.createConnection({
  host: "mydbshippy.ceglho9jw8iq.us-west-2.rds.amazonaws.com",
  user: "shippy",
  password: "12345678",
  database: "Shippy"
});

module.exports = connection;
