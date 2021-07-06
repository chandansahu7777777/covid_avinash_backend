const { forEach } = require('async');
const { response } = require('express');
const { check } = require('express-validator');
const { getMaxListeners } = require('..');
const Emailservice = require('../services/Emailservice');

try {
    const DatabaseService = require('../services/DatabaseService');
    const BasicService = require('../services/BasicService');
    const ServerResponse = require('../response');
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
    var Hogan = require('hogan.js');
    var fs = require('fs');
    // var template = fs.readFileSync('../views/email.hjs','utf-8');
    // var compileTemplate = Hogan.compile(template);


    exports.sign_otp = async (req, res, next) => {
        try {
            let phone_no = req.body.phone_no;
            let signup_otp = Math.floor(100000 + Math.random() * 900000);
            let check_phone = `select * from signup_otp where phone_no = '${phone_no}'`
            let response_check_response = await DatabaseService.single_query_transaction(check_phone);
            if (response_check_response.code == 200) {
                if (response_check_response.result.length == 0) {
                    let query = `insert into signup_otp (phone_no,otp) values ('${phone_no}','${signup_otp}')`;
                    let response = await DatabaseService.single_query_transaction(query);

                    let sms = await Emailservice.send_otp(phone_no, signup_otp);
                    if (sms == true) {
                        res.send({
                            'code': 200,
                            'message': 'OTP Sent Successfully'
                        });
                    } else {
                        res.send({
                            'code': 500,
                            'session_id': null,
                            'message': 'Something went wrong'
                        });
                    }

                } else {
                    let query = `update signup_otp set otp = '${signup_otp}' where phone_no = '${phone_no}'`;
                    let response = await DatabaseService.single_query_transaction(query);
                    let sms = await Emailservice.send_otp(phone_no, signup_otp);
                    if (sms == true) {
                        res.send({
                            'code': 200,
                            'message': 'OTP Sent Successfully'
                        });
                    } else {
                        res.send({
                            'code': 500,
                            'session_id': null,
                            'message': 'Something went wrong'
                        });
                    }


                }
            }




        } catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })

        }
    }

    exports.create = async (req, res, next) => {
        try {
            let email = await BasicService.check_string(req.body.email);
            let phone_no = req.body.phone_no;
            let name = await BasicService.check_string(req.body.name);
            let address = await BasicService.check_string(req.body.address);
            let otp = req.body.otp;
            let check_otp = `select * from signup_otp where phone_no = ${phone_no} and otp = ${otp} `
            let response_check_otp = await DatabaseService.single_query_transaction(check_otp);
            if (response_check_otp.result.length == 1) {



                let insert = `insert into users (name,phone_no,email,address) values ('${name}','${phone_no}','${email}','${address}')`;
                let response = await DatabaseService.single_query_transaction(insert);
                console.log(response.result.insertId);

                if (response.code == 200) {
                    let user_data = `select * from users where phone_no = '${phone_no}' `;
                    let response_user_data = await DatabaseService.single_query_transaction(user_data);

                    let insert = `insert into member (name ,phone_no,email,parent_id) values ('${name}','${phone_no}','${email}','${response.result.insertId}')`;
                    let response_insert = await DatabaseService.single_query_transaction(insert);


                    payload = {
                        user_id: response_user_data.result[0].id,
                        name: response_user_data.result[0].name,
                        email: response_user_data.result[0].email,
                        phone: response_user_data.result[0].phone_no,

                    }
                    let options = {};
                    token = jwt.sign(payload, secret, options);
                    res.status(200).send({
                        code: 200,
                        message: "User Signup Successfull",
                        token: token,
                        user_id: response_user_data.result[0].id

                    })
                }
                else {
                    res.status(500).send({
                        code: 500,
                        message: ServerResponse.messages.error
                    })

                }
            } else {
                res.status(210).send({
                    code: 210,
                    message: "Invalid OTP"
                })

            }
        }
        catch (e) {
            console.log(e);

            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })
        }
    }
    exports.signup_verify_login = async (req, res, next) => {
        try {
            console.log("here")
            let otp = req.body.otp;
            let phone_no = req.body.phone_no;
            let token;
            let check = `select * from users where signup_otp = '${otp}' and phone_no = '${phone_no}'`;
            let response = await DatabaseService.single_query_transaction(check);
            if (response.code == 200) {
                if (response.result.length == 1) {
                    console.log(response.result);
                    let update_status = `update users set verified = 1 where id = ${response.result[0].id}`
                    let response_update_status = await DatabaseService.single_query_transaction(update_status);
                    payload = {
                        user_id: response.result[0].id,
                        name: response.result[0].name,
                        email: response.result[0].email,
                        phone: response.result[0].phone_no,

                    }
                    let options = {};
                    token = jwt.sign(payload, secret, options);
                    res.send({
                        'code': 200,
                        'message': 'OTP Verifed',
                        'token': token
                    });


                } else {
                    res.send({
                        'code': 210,
                        'message': 'Invalid OTP'
                    });

                }
            }
        } catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })

        }
    }

    exports.send_login_otp = async (req, res, next) => {
        try {

            let phone_no = req.body.phone_no;
            let login_otp = Math.floor(100000 + Math.random() * 900000);
            let check_phoneno = `select * from users where phone_no = '${phone_no}'`;
            let response_check_phoneno = await DatabaseService.single_query_transaction(check_phoneno);
            if (response_check_phoneno.result.length == 1) {
                let update = `update users set login_otp = '${login_otp}'`;
                let response_update = await DatabaseService.single_query_transaction(update);
                if (response_update.code == 200) {
                    let sms = await Emailservice.send_otp(phone_no, login_otp);
                    if (sms == true) {
                        res.status(200).send({
                            code: 200,
                            message: 'OTP send successfully'
                        })
                    } else {
                        res.status(410).send({
                            code: 410,
                            message: 'Something went wrong'
                        })

                    }

                } else {
                    res.status(410).send({
                        code: 410,
                        message: 'Something went wrong'
                    })
                }

            } else {
                res.status(210).send({
                    code: 210,
                    message: 'user does not exists'
                })

            }

        } catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })

        }
    }


    exports.login = async (req, res, next) => {
        try {

            let otp = req.body.otp;
            let phone_no = req.body.phone_no;
            let check_otp = `select * from users where login_otp = '${otp}' and phone_no = '${phone_no}'`;
            let response_check_otp = await DatabaseService.single_query_transaction(check_otp);
            if (response_check_otp.result.length == 1) {

                payload = {
                    user_id: response_check_otp.result[0].id,
                    name: response_check_otp.result[0].name,
                    email: response_check_otp.result[0].email,
                    phone: response_check_otp.result[0].phone_no,

                }
                let options = {};
                token = jwt.sign(payload, secret, options);
                res.send({
                    'code': 200,
                    'message': 'OTP Verifed',
                    'token': token,
                    'user_id': response_check_otp.result[0].id
                });


            } else {
                res.status(210).send({
                    code: 210,
                    message: "Invalid OTP"
                })
            }


        }
        catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })
        }
    }
    exports.get_member_detais = async (req, res, next) => {
        try {
            let member_id = req.body.member_id;
            let get_data = `select * from member where id = '${member_id}' `;
            let response = await DatabaseService.single_query_transaction(get_data);
            if(response.code==200){
                
                res.status(200).send({
                    code: 200,
                    result: response.result
                })
            }else{
                res.status(410).send({
                    code: 410,
                    message : "something went wrong"
                })

            }

        }catch(e){
            console.log(e)
            res.status(410).send({
                code: 410,
                message : "something went wrong"
            })

        }
    }
    exports.user_details = async (req, res, next) => {
        try {
            let user_id = req.body.user_id;
            let get_user = `select * from users where id = ${user_id}`;
            let response = await DatabaseService.single_query_transaction(get_user);
            if (response.result.length == 1) {
                res.status(200).send({
                    code: 200,
                    data: response.result[0]
                })

            } else {
                res.status(210).send({
                    code: 210,
                    result: "user not found"
                })

            }

        } catch (e) {
            res.status(500).send({
                code: 500,
                result: "something went wrong"
            })

        }
    }
    exports.create_member = async (req, res, next) => {
        try {
            let user_id = req.body.user_id;
            let name = req.body.name;
            let phone_no = req.body.phone_no;
            let email = req.body.email;
            let address = req.body.address
            let insert = `insert into member (name,phone_no,email,parent_id,address) values ('${name}','${phone_no}','${email}','${user_id}','${address}')`;
            let response = await DatabaseService.single_query_transaction(insert);
            if (response.code == 200) {
                res.status(200).send({
                    code: 200,
                    data: "member created"
                })

            } else {
                res.status(500).send({
                    code: 500,
                    result: "something went wrong"
                })


            }


        } catch (e) {
            res.status(500).send({
                code: 500,
                result: "something went wrong"
            })

        }
    }
    exports.get_member_by_id = async (req, res, next) => {
        try {
            let user_id =  req.body.user_id;
            let get = `select * from member where parent_id = '${user_id}' order by id desc`;
            let get_response = await DatabaseService.single_query_transaction(get);
            let send_response = [];
            console.log(get_response)
            for(let i = 0 ; i<get_response.result.length;i++){
                let query = `select * from subscription where id = '${get_response.result[i].plan_id}'`;
                let query_response = await DatabaseService.single_query_transaction(query);
                if(get_response.result[i].plan_id==0){

                    send_response.push({
                        id : get_response.result[i].id,
                        name : get_response.result[i].name,
                        phone_no : get_response.result[i].phone_no,
                        email : get_response.result[i].email,
                        parent_id : get_response.result[i].parent_id,
                        address : get_response.result[i].address,
                        plan_id : get_response.result[i].plan_id,
    
                     } )
                }else{
                    
                    send_response.push({
                        id : get_response.result[i].id,
                        name : get_response.result[i].name,
                        phone_no : get_response.result[i].phone_no,
                        email : get_response.result[i].email,
                        parent_id : get_response.result[i].parent_id,
                        address : get_response.result[i].address,
                        plan_id : get_response.result[i].plan_id,
                        subscription_id : query_response.result[0].id,
                        plan_name : query_response.result[0].plan_name,
                        amount : query_response.result[0].amount,
                        status : query_response.result[0].status,
                        date : query_response.result[0].date,

                     } )

                }
             

            }
            
            if(get_response.code == 200){
                res.status(200).send({
                    code: 200,
                    result: send_response
                })

            }else{
                res.status(410).send({
                    code: 410,
                    result:"Somthing went Wrong !!"
                })

            }


        } catch (e) {
            console.log(e);
            res.status(500).send({
                code: 500,
                result: "something went wrong"
            })

        }
    }


    exports.check_phone_no_exists = async (req, res, next) => {
        try {
            let phone_no = req.body.phone_no;
            let check = `select * from users where phone_no = '${phone_no}'`;
            let response = await DatabaseService.single_query_transaction(check);
            if (response.result.length == 1) {
                res.status(210).send({
                    code: 210,
                    message: "User exists"
                })

            } else {
                res.status(200).send({
                    code: 200,
                    message: "user Doesnot exists"
                })

            }
        } catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })

        }
    }
    exports.add_subscription = async (req, res, next) => {
        try {
            let plan_name = req.body.plan_name;
            let amount = req.body.amount;
            let user_id = req.body.user_id;
            let member_id = req.body.member_id;
            let member_name = req.body.member_name;
            let phone_no = req.body.phone_no;
            let email = req.body.email;
            
            let insert = `insert into subscription (plan_name,amount,user_id,member_id,member_name,phone_no,email) values ('${plan_name}','${amount}','${user_id}','${member_id}','${member_name}','${phone_no}','${email}')`;
            let response = await DatabaseService.single_query_transaction(insert);
            if(response.code == 200){
                res.status(200).send({
                    code: 200,
                    message: "Data inserted"
                })

            }else{
                res.status(410).send({
                    code: 410,
                    message: "something went wrong"
                })

            }



          
        } catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })

        }
    }
    

    exports.change_password = async (req, res, next) => {
        try {
            // userid can be email, mobile number or username(in future);
            let userid = req.body.userid

            // User entered password
            let user_entered_password = req.body.password;

            let user_entered_new_password = req.body.user_entered_new_password;

            console.log(userid, user_entered_password, user_entered_new_password)

            let check_user = `select * from user_credentials where (email='${userid}' or phone_number='${userid}' )`;

            let check_user_existence = await DatabaseService.check_status_for_existence_in_database(check_user);

            if (check_user_existence == 1) {


                let user = `select * from user_credentials where (email='${userid}' or phone_number='${userid}' ) and password='${user_entered_password}'`;

                let password_match = await DatabaseService.check_status_for_existence_in_database(user);
                if (password_match == 1) {
                    let pass_update = `update user_credentials set password='${user_entered_new_password}' where ( phone_number='${userid}' or email='${userid}') `;
                    let response = await DatabaseService.single_query_transaction(pass_update);

                    if (response.code === 200) {
                        res.status(200).send({
                            code: 200,
                            message: 'Password ' + ServerResponse.messages.updated
                        })
                    } else {
                        res.status(210).send({
                            code: 210,
                            message: 'Password' + ServerResponse.messages.update_failed
                        })

                    }

                } else {

                    res.status(404).send({
                        code: 404,
                        message: 'password doesnot  match plz enter your old password '

                    })



                }
            } else {

                res.status(220).send({
                    code: 220,
                    message: 'user does not exist'
                })
            }


        } catch {
            res.status(404).send({
                code: 404,
                message: 'user doesnot exists '
            })



        }



    }


    exports.user_login = async (req, res, next) => {
        try {

            // userid can be email, mobile number or username(in future);
            let userid = req.body.userid

            // User entered password
            let user_entered_password = req.body.password;

            let user = `select * from user_credentials where (email='${userid}' or phone_number='${userid}') and role = '2'`;

            let user_existance = await DatabaseService.check_status_for_existence_in_database(user);

            if (user_existance === 1) {

                let user_data = await DatabaseService.fetch_data(user);

                if (user_data.code === 200) {

                    // User result
                    if (user_data.result != undefined && user_data.result.length > 0) {

                        let password = user_data.result[0].password;

                        let user_id = user_data.result[0].row_id;

                        if (password === user_entered_password) {

                            // Login

                            // check for user_id in session table
                            let check_for_user_id = `select * from session where user_id='${user_id}'`

                            let payload;

                            const options = {};

                            let token;

                            let data_for_token = `select ud.first_name, ud.last_name, concat(ud.first_name, " ", ud.last_name) as name, uc.email, uc.phone_number, r.type as role from user_credentials uc inner join user_details ud on uc.row_id = ud.user_id inner join roles r on r.row_id=uc.role where uc.row_id='${user_id}'`
                            let user_data = await DatabaseService.fetch_data(data_for_token)

                            if (user_data.code === 200) {
                                payload = {
                                    id: user_id,
                                    first_name: user_data.result[0].first_name,
                                    last_name: user_data.result[0].last_name,
                                    email: user_data.result[0].email,
                                    phone: user_data.result[0].phone_number,
                                    role: user_data.result[0].role,
                                }
                                token = jwt.sign(payload, secret, options);
                            }

                            let check_in_db = await DatabaseService.check_status_for_existence_in_database(check_for_user_id);

                            if (check_in_db === 1) {

                                let update_session = `update session set token='${token}' where user_id='${user_id}'`;

                                let update = await DatabaseService.single_query_transaction(update_session);

                                if (update.code === 200) {
                                    res.status(200).send({
                                        code: 200,
                                        message: 'Login' + ServerResponse.messages.success,
                                        token: token,
                                        user_data: user_data.result[0],
                                        user_id: user_id


                                    })
                                }

                            }
                            else {

                                let insert_into_session = `INSERT INTO session (user_id, token) VALUES ('${user_id}', '${token}')`;

                                let insert = await DatabaseService.single_query_transaction(insert_into_session)

                                if (insert.code === 200) {
                                    res.status(200).send({
                                        code: 200,
                                        message: 'Login' + ServerResponse.messages.success,
                                        token: token
                                    })
                                }

                            }

                        }

                        else {

                            res.status(210).send({
                                code: 210,
                                message: 'Incorrect Password.'
                            })

                        }

                    }

                }

            }
            // User Doesnot Exist
            else {
                res.status(207).send({
                    code: 410,
                    message: 'User not found. '
                })
            }

        }
        catch (e) {
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })
        }
    }

    exports.user_exist = async (req, res, next) => {
        try {
            let email = req.body.email

            let check_user = `select * from user_credentials where (email='${email}' or phone_number='${email}' )`;

            let check_user_existence = await DatabaseService.check_status_for_existence_in_database(check_user);

            if (check_user_existence == 1) {
                res.status(200).send({
                    code: 200,
                    message: 'User ' + ServerResponse.messages.already_exist
                })
            } else {
                res.status(210).send({
                    code: 210,
                    message: 'User ' + ServerResponse.messages.does_not_exist
                })
            }

        } catch (e) {
            res.status(500).send({
                code: 500,
                message: ServerResponse.messages.error
            })
        }
    }

    exports.forgot_password = async (req, res, next) => {
        try {
            // userid can be email, mobile number or username(in future);
            let email = req.body.email

            // User entered password
            let user_entered_password = req.body.password;

            let user_entered_new_password = req.body.user_entered_new_password;

            let check_user = `select * from user_credentials where (email='${email}' or phone_number='${email}' )`;

            let check_user_existence = await DatabaseService.check_status_for_existence_in_database(check_user);

            if (check_user_existence == 1) {


                let user = `select * from user_credentials where (email='${email}' or phone_number='${email}' )`;

                let password_match = await DatabaseService.check_status_for_existence_in_database(user);
                if (password_match == 1) {
                    let pass_update = `update user_credentials set password='${user_entered_new_password}' where ( phone_number='${email}' or email='${email}') `;
                    let response = await DatabaseService.single_query_transaction(pass_update);

                    if (response.code === 200) {
                        res.status(200).send({
                            code: 200,
                            message: 'Password ' + ServerResponse.messages.updated
                        })
                    } else {
                        res.status(210).send({
                            code: 210,
                            message: 'Password' + ServerResponse.messages.update_failed
                        })

                    }

                } else {

                    res.status(404).send({
                        code: 404,
                        message: 'password doesnot  match plz enter your old password '

                    })



                }
            } else {

                res.status(220).send({
                    code: 220,
                    message: 'user does not exist'
                })
            }


        } catch (e) {
            console.log(e)
            res.status(404).send({
                code: 404,
                message: 'user doesnot exists '
            })



        }



    }
    exports.add_address = async (req, res, next) => {
        try {
            let user_id = req.body.user_id;
            let address_type = req.body.address_type;//for delivery address 1 ,for biling addres 0
            let first_name = req.body.first_name;
            let last_name = req.body.last_name;
            let company_name = req.body.company_name;
            let gstn = req.body.gstn;
            let phone_no = req.body.phone_no;
            let address = req.body.address;
            let appartment = req.body.appartment;
            let country = req.body.country;
            let state = req.body.state;
            let city = req.body.city;
            let postalcode = req.body.postalcode;
            let query = `insert into address (user_id, address_type, first_name, last_name, company_name, gstn, phone_no, address, appartment, country, state, city, postalcode) VALUES ('${user_id}', '${address_type}', '${first_name}', '${last_name}', '${company_name}', '${gstn}', '${phone_no}', '${address}', '${appartment}', '${country}', '${state}', '${city}', '${postalcode}') `;
            let response_query = await DatabaseService.single_query_transaction(query);
            if (response_query.code === 200) {
                res.status(200).send({
                    code: 200,
                    message: 'Address ' + ServerResponse.messages.created
                })
            } else {
                res.status(210).send({
                    code: 210,
                    message: 'Password' + ServerResponse.messages.update_failed
                })

            }




        } catch (e) {
            console.log(e)
            res.status(404).send({
                code: 404,
                message: 'user doesnot exists '
            })

        }
    }

    exports.view_address = async (req, res, next) => {
        try {
            let user_id = req.body.user_id;
            let address_type = req.body.address_type;
            let query = `select * from address where user_id ='${user_id}' and address_type = '${address_type}' order by id desc  `;
            let response = await DatabaseService.single_query_transaction(query);
            console.log(response);
            if (response.code === 200) {
                res.status(200).send({
                    code: 200,
                    result: response.result
                })
            } else {
                res.status(210).send({
                    code: 210,
                    message: 'address' + ServerResponse.messages.update_failed
                })

            }





        } catch (e) {
            console.log(e)
            res.status(404).send({
                code: 404,
                message: 'user doesnot exists '
            })

        }
    }

    exports.sendemail = async (req, res, next) => {
        try {
            console.log("send email called");
            let order_id = 10045;
            // let query_get_order = `select * from orders where order_id = '${order_id}'`;
            //   let response = await DatabaseService.single_query_transaction(query_get_order);
            //   console.log(response.result[0].user_name)

            //   res.status(200).send({
            //           code: 200,
            //           data: response.result})
            let email = await Emailservice.send_confirmation_email(10045, "chandan", 50000,);
            console.log(email);
            if (email.code == 200) {
                res.status(200).send({
                    code: 200,
                    message: "Otp mail sent",
                })
            }
            // var transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     auth: {
            //         user: 'sanguinesportshelp@gmail.com',
            //         pass: 'micromax'
            //     }
            // });
            // const mailOptions = {
            //     from: 'sanguinesportshelp@gmail.com', // sender address
            //     to: 'swarnmudracg@gmail.com', // list of receivers
            //     subject: 'Sanguine Support (Welcome To Sanguine)', // Subject line
            //     html:"hhsls"
            // };

            // transporter.sendMail(mailOptions, function (err, info) {
            //     if (err)
            //         console.log(err)
            //     else
            //         console.log(info);
            //     res.status(200).send({
            //         code: 200,
            //         message: "Otp mail sent",

            //     })

            // });

        } catch (e) {
            console.log(e)

        }
    }


} catch (e) {
    console.log(e)
}