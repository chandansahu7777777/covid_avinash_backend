require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');
const environment = process.env.NODE_ENV;
const stage = require('./config')[environment];
const secret = stage.JWT_SECRET;
const pool = require('./model/mysql_connection');
const crypto = require('crypto');
const morgan = require('morgan');
var async = require('async');
const compression = require('compression');

// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);
// app.use(express.static(__dirname + '../client/dist/ecommerce'));
// const html = '../client/dist/ecommerce'
// app.set('views', path.join(__dirname, 'views'));
console.log(__dirname)

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '../client/dist/ecommerce'));
const html = '../client/dist/ecommerce'
app.engine('html1', require('ejs').renderFile);
app.use(express.static(__dirname + './files'));

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'jade');

app.use(compression());

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.gif',
  '.jpeg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
  '.pdf',
  '.ejs',
  '.pdf',
  '.jade'
];

app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cors());


app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(morgan('dev'));

// Route For Version 1
const v1 = require('./versions/v1');
const DatabaseService = require('./services/DatabaseService');
const { query } = require('express-validator');
const Emailservice = require('./services/Emailservice');
const Paytm = require('paytmchecksum');

// API Call For Version 1 
app.use('/v1', v1)

const server = app.listen(`${stage.port}`, () => {
  console.log(`Server now listening at localhost:${stage.port}`);
});

server.timeout = 1000000;


// require('./services/SocketService')(io);

app.get('*', function (req, res, next) {
  if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`../client/dist/ecommerce/${req.url}`));
  } else {
    res.sendFile('index.html', {
      root: html
    });
  }
});

app.post('/request', async function (req, res, next) {
  const https = require('https');
  /*
  * import checksum generation utility
  * You can get this utility from https://developer.paytm.com/docs/checksum/
  */
  const PaytmChecksum = require('./PaytmChecksum');
  // const{amount,email}=req.body;


  var paytmParams = {};

  paytmParams.body = {
    "requestType": "NATIVE_SUBSCRIPTION",
    "mid": "xGpLit55928070794586",
    "websiteName": "WEBSTAGING",
    "orderId": req.body.orderId,
    "callbackUrl": "https://merchant.com/callbackff",
    "subscriptionAmountType": "FIX",
    "subscriptionFrequency": "2",
    "subscriptionFrequencyUnit": "MONTH",
    "subscriptionExpiryDate": "2031-05-20",
    "subscriptionEnableRetry": "1",
    "txnAmount": {
      "value": "1.00",
      "currency": "INR",
    },
    "userInfo": {
      "custId": "CUST_0045",
    },
  };

  /*
  * Generate checksum by parameters we have in body
  * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
  */
  /* import checksum generation utility */
  // var PaytmChecksum = require("./PaytmChecksum");

  var paytmParams = {};

  /* initialize an array */
  paytmParams["MID"] = "xGpLit55928070794586";
  paytmParams["WEBSITE"] = "WEBSTAGING";
  paytmParams["CHANNEL_ID"] = "WEB";
  paytmParams["INDUSTRY_TYPE_ID"] = "Retail";
  // paytmParams["ORDERID"] = req.body.orderId;
  paytmParams["CUST_ID"] = "cs_001";
  paytmParams["TXN_AMOUNT"] = '1';
  paytmParams["CALLBACK_URL"] = "https://merchant.com/callbackff";
  paytmParams["EMAIL"] = "chandansahu7777777@gmail.com";
  paytmParams["MOBILE_NO"] = "8305196940";







  paytmParams["ORDERID"] = req.body.orderId;

  console.log(paytmParams['ORDERID']);

  /**
  * Generate checksum by parameters we have
  * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
  */
  PaytmChecksum.generateSignature(JSON.stringify(paytmParams), "&VjKAIP3P0h1vapR").then(function (checksum) {
    console.log("generateSignature Returns: " + checksum);
    /* import checksum generation utility */
    // var PaytmChecksum = require("./PaytmChecksum");

    // paytmChecksum = request.body.CHECKSUMHASH;
    // delete request.body.CHECKSUMHASH;

    var isVerifySignature = PaytmChecksum.verifySignature(paytmParams, '&VjKAIP3P0h1vapR', checksum);
    if (isVerifySignature) {
      console.log("Checksum Matched");
      let send = { "checksum": checksum };
      res.json(send);
    } else {
      console.log("Checksum Mismatched");
    }

  }).catch(function (error) {
    console.log(error);
  });




})
app.post('/response', async function (req, res, next) {
  console.log("Response Called")
  console.log(req)
  console.log(req)
})

app.post('/paytm_init', async (req, res, next) => {
  const https = require('https');
  let order = new Date().getTime()
  /*
  * import checksum generation utility
  * You can get this utility from https://developer.paytm.com/docs/checksum/
  */
  const PaytmChecksum = require('./PaytmChecksum');

  var paytmParams = {};

  paytmParams.body = {
    "requestType": "NATIVE_SUBSCRIPTION",
    "mid": "xGpLit55928070794586",
    "websiteName": "WEBSTAGING",
    "orderId": order,
    "callbackUrl": "https://merchant.com/callback",
    "subscriptionAmountType": "FIX",
    "subscriptionFrequency": "2",
    "subscriptionFrequencyUnit": "MONTH",
    "subscriptionExpiryDate": "2031-05-20",
    "subscriptionEnableRetry": "1",
    "txnAmount": {
      "value": "1.00",
      "currency": "INR",
    },
    "userInfo": {
      "custId": "CUST_001",
    },
  };

  /*
  * Generate checksum by parameters we have in body
  * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
  */
  PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "&VjKAIP3P0h1vapR").then(function (checksum) {

    console.log(checksum)
    paytmParams.head = {
      "signature": checksum
    };

    
    let post_data = JSON.stringify(paytmParams);
    console.log(post_data)

    let options = {

      /* for Staging */
      hostname: 'securegw-stage.paytm.in',

      /* for Production */
      // hostname: 'securegw.paytm.in',

      port: 443,
      path: '/subscription/create?mid=xGpLit55928070794586&orderId=' + order,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': post_data.length
      }
    };

    let response = "";
    let post_req = https.request(options, function (post_res) {
      post_res.on('data', function (chunk) {
        response += chunk;
        console.log(chunk, "\n")
      });

      post_res.on('end', function () {
        console.log('Response: ', response);
      });
    });

    post_req.write(post_data);
    post_req.end();
  });
})
let mid = 'xGpLit55928070794586'
let mkey = '&VjKAIP3P0h1vapR'
app.post('/paytm_2', async function (req, res, next) {
  var PaytmChecksum = require("PaytmChecksum");
  const https = require('https');
  var paytmParams = {};

  let time = new Date().valueOf()

  PaytmChecksum.generateSignature(JSON.stringify({
      "requestType": "NATIVE_SUBSCRIPTION",
      "mid": mid,
      "websiteName": "WEBSTAGING",
      "orderId": time,
      "callbackUrl": "https://stage-securegw.paytm.in/theia/paytmCallback?ORDER_ID="+time,
      "subscriptionAmountType":"FIX",
      "subscriptionFrequency":"2",
      "subscriptionFrequencyUnit":"MONTH",
      "subscriptionExpiryDate":"2031-05-20",
      "subscriptionEnableRetry":"1",
      "txnAmount": {
          "value": "1.00",
          "currency": "INR",
      },
      "userInfo": {
          "custId": "CUST_001",
      },
  }), mkey).then(async function  (checksum) {

      paytmParams.head = {
          "signature": checksum
      };
      console.log(paytmParams);

      paytmParams.body = {
        "requestType": "NATIVE_SUBSCRIPTION",
      "mid": mid,
      "websiteName": "WEBSTAGING",
      "orderId": time,
      "callbackUrl": "https://stage-securegw.paytm.in/theia/paytmCallback?ORDER_ID="+time,
      "subscriptionAmountType":"FIX",
      "subscriptionFrequency":"2",
      "subscriptionFrequencyUnit":"MONTH",
      "subscriptionExpiryDate":"2031-05-20",
      "subscriptionEnableRetry":"1",
      "txnAmount": {
          "value": "1.00",
          "currency": "INR",
      },
      "userInfo": {
          "custId": "CUST_001",
      },
      }

      var post_data = JSON.stringify(paytmParams);

      var options = {

          hostname: 'securegw.paytm.in',
          port: 443,
          path: '/theia/api/v1/initiateTransaction?mid='+mid+'&orderId=' + time,
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': post_data.length
          }
      };

      var response = "";
      var post_req =  await https.request(options, function (post_res) {
          post_res.on('data', function (chunk) {
              response += chunk;
          });

          post_res.on('end', function () {
              console.log('Request', post_data)
              console.log('Response: ', response);
              res.status(200).send({
                code: 200,
                result: JSON.parse(response),
                orderId:time
            })
          });
      });
      

      post_req.write(post_data);
      post_req.end();
     

  });
})



module.exports = app;
