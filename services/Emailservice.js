var pool = require('../model/mysql_connection');
const environment = process.env.NODE_ENV;
const stage = require('../config')[environment];
const jwt = require('jsonwebtoken');
const secret = stage.JWT_SECRET;
var nodemailer = require('nodemailer');
const http = require('http');
var qs = require("querystring");
var aes256 = require('aes256');
var crypto = require('crypto');
var async = require('async')

module.exports = {
    send_mail: async function (email,name) {
        return new Promise((resolve, reject) => {
            try {
               
                console.log("send email called");
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'sanguinesportshelp@gmail.com',
                        pass: 'micromax'
                    }
                });
                const mailOptions = {
                    from: 'sanguinesportshelp@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: 'Sanguine Support (Welcome To Sanguine)', // Subject line
                    html:'<H1 style="margin-bottom: 0;">Hello '+name+', </h1><br><H2 style="margin-top: 0;">Welcome to Sanguine.com</H2><br><H2 style="margin-top: 0;">Enjoy Your Shoping :)</H2>'
                };
    
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err)
                        console.log(err)
                        
                    else
                        console.log(info);
                        result = {
                            code : 200,
                        }
                        resolve(result);

    
                });
            }
            catch (e) {
                reject(e)
            }
        })
    },
    send_confirmation_email: async function (order_id,name , total_amount,email  ) {
        return new Promise((resolve, reject) => {
            try {
                var locationurl  = "http://65.0.126.157:8000/shop/checkout/success/success/";
               
                console.log("send email called");
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'sanguinesportshelp@gmail.com',
                        pass: 'micromax'
                    }
                });
                const mailOptions = {
                    from: 'sanguinesportshelp@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: 'Order Placed Payment Succesfull.', // Subject line
                    html:'<H1 style="margin-bottom: 0;">Hello '+name+', </h1><br><H2 style="margin-top: 0;">Your Payment of ₹'+total_amount+' with respect to Order ID - '+order_id+'.</H2><br><h3 style="margin-top: 0; margin-bottom:0">Download Your Invoice by the below link </h3><br><a href="http://65.0.126.157:8000/shop/checkout/success/download/'+order_id+'" style="color: aliceblue; background-color: rgb(122, 122, 185); padding: 5px;text-decoration: none;">Download Invoice </a><H2 style="margin-top: 0;">Enjoy Your Shoping :)</H2>'
                };
    
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err)
                        console.log(err)
                        
                    else
                        console.log(info);
                        result = {
                            code : 200,
                        }
                        resolve(result);

    
                });
            }
            catch (e) {
                reject(e)
            }
        })
    },send_otp: async function(phone_no,signup_otp){
        return new Promise((resolve, reject) => {
            try {

                
                    let template = "dhulai"
    
    
                    var new_res = [];
                    var url = `/API/V1/671ce180-521b-11e9-8806-0200cd936042/SMS/${phone_no}/${signup_otp}/${template}`
                    var options = {
                        "method": "POST",
                        "hostname": "2factor.in",
                        "port": null,
                        "path": url,
                        "headers": {
                            "content-type": "application/x-www-form-urlencoded"
                        }
                    };
    
                    var req = http.request(options, function (response) {
                        var chunks = [];
    
                        response.on("data", function (chunk) {
                            chunks.push(chunk);
                        });
    
                        response.on("end", function () {
                            var body = Buffer.concat(chunks);
                            var sms_res = body.toString();
                            new_res = JSON.parse(sms_res);
                            if (new_res.Status == "Success") {
                                res_sms(200);
                            } else {
                                res_sms(210);
                            }
                        });
                    });
    
                    req.write(qs.stringify({}));
                    req.end();
    
                    async function res_sms(code) {
                        if (code == 200) {
                            try {
                                // res.send({
                                //     'code': 200,
    
                                //     'message': 'OTP Sent Successfully'
                                // });
                                resolve(true);
                            }
                            catch (e) {
                                // res.send({
                                //     'code': 500,
    
                                //     'message': 'Something went wrong'
                                // });
                                resolve(false);
                            }
                        } else {
                           resolve(false);
                        }
                    }
    
    
               
            }catch(e){

            }
        });
    

    }
}