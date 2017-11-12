// import mysql from 'mysql'
//
// /*let connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "1234",
//   database: "shippy_local"
// });*/
//
// // let connection = mysql.createConnection({
// //   host: 'shippy.mysql.database.azure.com',
// //   user: 'cuongnm@shippy',
// //   password: 'Cuong1821995',
// //   database: 'shippy',
// //   port: 3306,
// //   ssl: true
// // });
//
// let connection = mysql.createConnection({
//   host: "shippy.cum65ahmr9e4.us-west-2.rds.amazonaws.com",
//   user: "shippy",
//   password: "12345678",
//   database: "Shippy",
//   port: 3306,
//   ssl: true
// });
//
// module.exports = connection;


import mysql from 'mysql'
//-
//- Connection configuration
//-
let db_config = {
  host: 'shippy.mysql.database.azure.com',
  user: 'cuongnm@shippy',
  password: 'Cuong1821995',
  database: 'shippy',
  port: 3306,
  ssl: true
};

// let db_config = {
//   host: "shippy.cum65ahmr9e4.us-west-2.rds.amazonaws.com",
//   user: "shippy",
//   password: "12345678",
//   database: "Shippy",
//   port: 3306,
//   ssl: true
// };


//-
//- Create the connection variable
//-
let connection = mysql.createPool(db_config);


//-
//- Establish a new connection
//-
connection.getConnection(function(err){
    if(err) {
        // mysqlErrorHandling(connection, err);
        console.log("\n\t *** Cannot establish a connection with the database. ***");

        connection = reconnect(connection);
    }else {
        console.log("\n\t *** New connection established with the database. ***")
    }
});


//-
//- Reconnection function
//-
function reconnect(connection){
    console.log("\n New connection tentative...");

    //- Create a new one
    connection = mysql.createPool(db_config);

    //- Try to reconnect
    connection.getConnection(function(err){
        if(err) {
            //- Try to connect every 2 seconds.
            setTimeout(reconnect(connection), 2000);
        }else {
            console.log("\n\t *** New connection established with the database. ***")
            return connection;
        }
    });
}


//-
//- Error listener
//-
connection.on('error', function(err) {

    //-
    //- The server close the connection.
    //-
    if(err.code === "PROTOCOL_CONNECTION_LOST"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    }

    else{
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

});


//-
//- Export
//-
module.exports = connection;
