var http = require("http");
var fs = require('fs');
var request = require('request');
var path = require('path');

module.exports = function(req,res,next){
	let accesstoken = req.body.accesstoken || req.query.accesstoken || req.headers['x-access-token'];
	//var accesstoken = req.body.accesstoken;
  //probably clean accesstoken to avoid injections
  //request to Account kit API endpoint to authenticate user
  request('https://graph.accountkit.com/v1.2/me/?access_token='+accesstoken, function (error, response, body) {
		if(error){
			res.send({
				"data" : [],
				"message" : 'Authentication service Facing Down time',
				"status" : 500,
				"data_count" : 0
			});
		}
		else if(response.statusCode !== 200){
			res.send({
				"log": response,
				"data" : [],
				"message" : 'Authentication failed',
				"status" : 500,
				"data_count" : 0
			});
		}
		else
		{
      //here we got the Mobile Number -> Query DB -> identify the user to service
			var temp = JSON.parse(body);
			console.log(req.body.phone);
			//req.body.phone = temp.phone.national_number;
			// res.send({
			// 	"log": response
			// });
			next();
		}
	});
}
