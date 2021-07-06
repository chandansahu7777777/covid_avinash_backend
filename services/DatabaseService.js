
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

// Setup for mailing
const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    secure: false,
    auth: {
        user: stage.email,
        pass: stage.password
    },
    tls: {
        rejectUnauthorized: false
    }
});

let self = module.exports = {
    // Check If The Data Exist in Database Already
    check_status_for_existence_in_database: async function (query) {
        return new Promise((resolve, reject) => {
            try {
                let exist_query = `SELECT EXISTS(` + query + `) as 'EXISTS'`
                pool.query(exist_query, (err, results, fields) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results[0].EXISTS);
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // Fetch Data from Database for a single query
    fetch_data: async function (query) {
        return new Promise((resolve, reject) => {
            try {
                pool.query(query, (err, results, fields) => {
                    if (err) {
                        let response = {
                            code: 500,
                            result: err
                        }
                        reject(response)
                    } else {
                        let response = {
                            code: 200,
                            result: results
                        }
                        resolve(response);
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // Transaction with single query
    single_query_transaction: async function (query) {
        return new Promise((resolve, reject) => {
            try {
                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(query, (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        connection.commit((err) => {
                                            if (err) {
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.release();
                                                let response = {
                                                    result: result,
                                                    code: 200
                                                }
                                                resolve(response)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // Transaction with double query
    double_query_transaction: async function (query1, query2) {
        return new Promise((resolve, reject) => {
            try {
                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(query1, (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        connection.query(query2, (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.commit((err) => {
                                                    if (err) {
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        connection.release();
                                                        let response = {
                                                            result: result,
                                                            code: 200
                                                        }
                                                        resolve(response)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // Transaction with triple query
    triple_query_transaction: async function (query1, query2, query3) {
        return new Promise((resolve, reject) => {
            try {
                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(query1, (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        connection.query(query2, (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.query(query3, (err, result, fields) => {
                                                    if (err) {
                                                        connection.release();
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        connection.commit((err) => {
                                                            if (err) {
                                                                let response = {
                                                                    result: err,
                                                                    code: 500
                                                                }
                                                                reject(response)
                                                            } else {
                                                                connection.release();
                                                                let response = {
                                                                    result: result,
                                                                    code: 200
                                                                }
                                                                resolve(response)
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    delete_product_transaction: async function (query1, query2, query3, query4, query5, query6, query7, query8, query9, query10, query11, query12) {
        return new Promise((resolve, reject) => {
            try {
                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(query1, (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        connection.query(query2, (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.query(query3, (err, result, fields) => {
                                                    if (err) {
                                                        connection.release();
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        connection.query(query4, (err, result, fields) => {
                                                            if (err) {
                                                                connection.release();
                                                                let response = {
                                                                    result: err,
                                                                    code: 500
                                                                }
                                                                reject(response)
                                                            } else {
                                                                connection.query(query5, (err, result, fields) => {
                                                                    if (err) {
                                                                        connection.release();
                                                                        let response = {
                                                                            result: err,
                                                                            code: 500
                                                                        }
                                                                        reject(response)
                                                                    } else {
                                                                        connection.query(query6, (err, result, fields) => {
                                                                            if (err) {
                                                                                connection.release();
                                                                                let response = {
                                                                                    result: err,
                                                                                    code: 500
                                                                                }
                                                                                reject(response)
                                                                            } else {
                                                                                connection.query(query7, (err, result, fields) => {
                                                                                    if (err) {
                                                                                        connection.release();
                                                                                        let response = {
                                                                                            result: err,
                                                                                            code: 500
                                                                                        }
                                                                                        reject(response)
                                                                                    } else {
                                                                                        connection.query(query8, (err, result, fields) => {
                                                                                            if (err) {
                                                                                                connection.release();
                                                                                                let response = {
                                                                                                    result: err,
                                                                                                    code: 500
                                                                                                }
                                                                                                reject(response)
                                                                                            } else {
                                                                                                connection.query(query9, (err, result, fields) => {
                                                                                                    if (err) {
                                                                                                        connection.release();
                                                                                                        let response = {
                                                                                                            result: err,
                                                                                                            code: 500
                                                                                                        }
                                                                                                        reject(response)
                                                                                                    } else {
                                                                                                        connection.query(query10, (err, result, fields) => {
                                                                                                            if (err) {
                                                                                                                connection.release();
                                                                                                                let response = {
                                                                                                                    result: err,
                                                                                                                    code: 500
                                                                                                                }
                                                                                                                reject(response)
                                                                                                            } else {
                                                                                                                connection.query(query11, (err, result, fields) => {
                                                                                                                    if (err) {
                                                                                                                        connection.release();
                                                                                                                        let response = {
                                                                                                                            result: err,
                                                                                                                            code: 500
                                                                                                                        }
                                                                                                                        reject(response)
                                                                                                                    } else {
                                                                                                                        connection.query(query12, (err, result, fields) => {
                                                                                                                            if (err) {
                                                                                                                                connection.release();
                                                                                                                                let response = {
                                                                                                                                    result: err,
                                                                                                                                    code: 500
                                                                                                                                }
                                                                                                                                reject(response)
                                                                                                                            } else {
                                                                                                                                connection.commit((err) => {
                                                                                                                                    if (err) {
                                                                                                                                        let response = {
                                                                                                                                            result: err,
                                                                                                                                            code: 500
                                                                                                                                        }
                                                                                                                                        reject(response)
                                                                                                                                    } else {
                                                                                                                                        connection.release();
                                                                                                                                        let response = {
                                                                                                                                            result: result,
                                                                                                                                            code: 200
                                                                                                                                        }
                                                                                                                                        resolve(response)
                                                                                                                                    }
                                                                                                                                })
                                                                                                                            }
                                                                                                                        })
                                                                                                                    }
                                                                                                                })
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // Transaction with quad query
    quad_query_transaction: async function (query1, query2, query3, query4) {
        return new Promise((resolve, reject) => {
            try {
                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(query1, (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        connection.query(query2, (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.query(query3, (err, result, fields) => {
                                                    if (err) {
                                                        connection.release();
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        connection.query(query4, (err, result, fields) => {
                                                            if (err) {
                                                                connection.release();
                                                                let response = {
                                                                    result: err,
                                                                    code: 500
                                                                }
                                                                reject(response)
                                                            } else {
                                                                connection.commit((err) => {
                                                                    if (err) {
                                                                        let response = {
                                                                            result: err,
                                                                            code: 500
                                                                        }
                                                                        reject(response)
                                                                    } else {
                                                                        connection.release();
                                                                        let response = {
                                                                            result: result,
                                                                            code: 200
                                                                        }
                                                                        resolve(response)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // get a random x digit id of "length" and input "characters"
    get_random_id: async function (length, chars) {
        return new Promise((resolve, reject) => {
            try {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
                resolve(result)
            }
            catch (e) {
                reject(e);
            }
        })
    },
    // Create User Account
    create_user_account: async function (insert_into_user_credentials, insert_into_user_details_initial, insert_into_user_details_final, insert_into_delivery_locations_initial, insert_into_delivery_locations_final, user_data, otp) {
        return new Promise((resolve, reject) => {
            try {
                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(insert_into_user_credentials, (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        let user_id = result.insertId;
                                        connection.query(insert_into_user_details_initial + user_id + insert_into_user_details_final, (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.query(insert_into_delivery_locations_initial + user_id + insert_into_delivery_locations_final, (err, result, fields) => {
                                                    if (err) {
                                                        connection.release();
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        const payload = { ...user_data, id: user_id };
                                                        const options = {};
                                                        const token = jwt.sign(payload, secret, options);
                                                        let insert_into_session = `INSERT INTO session (user_id, token) VALUES ('${user_id}', '${token}')`
                                                        connection.query(insert_into_session, (err, result, fields) => {
                                                            if (err) {
                                                                connection.release();
                                                                let response = {
                                                                    result: err,
                                                                    code: 500
                                                                }
                                                                reject(response)
                                                            } else {
                                                                connection.commit((err) => {
                                                                    if (err) {
                                                                        let response = {
                                                                            result: err,
                                                                            code: 500
                                                                        }
                                                                        reject(response)
                                                                    } else {
                                                                        connection.release();
                                                                        let response = {
                                                                            result: result,
                                                                            code: 200,
                                                                            token: token,
                                                                            id: user_id
                                                                        }
                                                                        resolve(response)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    // Check If User Is Logged In
    check_user_logged_in: async function (token, user_id) {
        let query = `select token from session where user_id='${user_id}'`;
        return new Promise((resolve, reject) => {
            try {
                pool.query(query, (err, results, fields) => {
                    if (err) {
                        let response = {
                            code: 500,
                            result: err
                        }
                        reject(response)
                    } else {
                        if (results != undefined && results.length > 0) {
                            if (results[0].token === token) {
                                resolve(true)
                            } else {
                                reject(false)
                            }
                        } else {
                            reject(false)
                        }
                    }
                })
            }
            catch (e) {
                reject(e)
            }
        })
    },
    fetch_data_from_two_queries: async function (query1, query2) {
        return new Promise((resolve, reject) => {
            pool.query(query1, (err, result1, fields) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    pool.query(query2, (err, result2, fields) => {
                        if (err) {
                            console.log(err)
                            reject(err)
                        } else {
                            resolve({
                                code: 200,
                                result: [...result1, ...result2]
                            });
                        }
                    })
                }
            })
        })
    },
    add_child_node_to_tree: async function (data) {
        return new Promise((resolve, reject) => {
            let final = data.map(item => ({ ...item, children: [] }))
            resolve(final);
        })
    },
    find_parent_of_category_tree: async function (data) {
        return new Promise((resolve, reject) => {
            let final = data.filter(item => item.parent === null);
            resolve(final);
        })
    },
    make_tree: async function (data) {
        try {
            let final_data = await this.add_child_node_to_tree(data);
            let parent_category = await this.find_parent_of_category_tree(final_data);
            let to_be_sent = [...parent_category];
            let left_out = [];
            return new Promise(async (resolve, reject) => {
                for (var index = 0; index < final_data.length; index++) {
                    if (final_data[index].parent != null) {
                        let exist = to_be_sent.findIndex(i => i.row_id === final_data[index].parent);
                        if (exist !== -1) {
                            to_be_sent[exist].children.push(final_data[index])
                        } else {
                            left_out.push(final_data[index])
                        }
                    }
                    if (index === final_data.length - 1) {
                        // let data = await this.recursive_tree(to_be_sent, left_out);
                        resolve({ result: to_be_sent, result2: left_out, code: 200 });
                    }
                }
            })
        }
        catch (e) {
            console.log(e)
            return ({
                code: 500,
                message: 'Something went wrong.'
            })
        }
    },
    insert_into_variants: async function (product_index, query_to_insert_variant, variants, connection) {
        return new Promise(async (resolve, reject) => {
            try {
                async.eachSeries(variants, async function iterateValues(element, callback) {
                    try {
                        let query = query_to_insert_variant + `(${product_index}, "${element.stock_keeping_unit}", "${element.weight}", ${element.weight_unit}, "${element.length}", "${element.width}", "${element.height}", '${element.length_unit}', ${element.purchasable}, "${element.image}", ${parseFloat(element.price)}, '${element.discount_type}', '${element.discount_value}')`
                        let response = await connection.query(query)
                        if (element === variants[variants.length - 1]) {
                            resolve(true)
                        }
                        callback
                    } catch (e) {
                        reject(e)
                    }
                })
            } catch (e) {
                reject(e)
            }

        })
    },
    insert_into_images: async function (product_index, query_to_insert_images, images, connection) {
        try {
            return new Promise(async (resolve, reject) => {
                async.eachSeries(images, async function iterateValues(element, callback) {
                    try {
                        console.log(images);
                        let query = query_to_insert_images + `(${product_index}, "${element.image}", "${element.description}", ${element.is_thumbnail}, '${element.media_type}')`
                        console.log(query);
                        let response = await connection.query(query)
                        if (element === images[images.length - 1]) {
                            resolve(true)
                        }
                        callback
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        } catch (e) {
            reject(e)
        }
    },
    insert_into_related_products: async function (product_index, query_to_insert_related_products, related_products, connection) {
        try {
            return new Promise(async (resolve, reject) => {
                async.eachSeries(related_products, async function iterateValues(element, callback) {
                    try {
                        let query = query_to_insert_related_products + `(${product_index}, "${element}")`
                        let response = await connection.query(query)
                        if (element === related_products[related_products.length - 1]) {
                            resolve(true)
                        }
                        callback
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        } catch (e) {
            reject(e)
        }
    },
    insert_into_custom_fields: async function (product_index, query_to_insert_custom_fields, custom_fields, connection) {
        try {
            return new Promise(async (resolve, reject) => {
                async.eachSeries(custom_fields, async function iterateValues(element, callback) {
                    try {
                        let query = query_to_insert_custom_fields + `(${product_index}, "${element.name}", "${element.value}")`
                        let response = await connection.query(query)
                        if (element === custom_fields[custom_fields.length - 1]) {
                            resolve(true)
                        }
                        callback
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        } catch (e) {
            reject(e)
        }
    },
    insert_into_search_keyword: async function (product_index, query_to_insert_search, keywords, connection) {
        try {
            return new Promise(async (resolve, reject) => {
                async.eachSeries(keywords, async function iterateValues(element, callback) {
                    try {
                        let query = query_to_insert_search + `(${product_index}, "${element.trim()}")`
                        let response = await connection.query(query)
                        if (element === keywords[keywords.length - 1]) {
                            resolve(true)
                        }
                        callback
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        } catch (e) {
            reject(e)
        }
    },
    insert_into_tracking: async function (product_index, query_to_insert_tracking, is_tracking_stock, connection) {
        try {
            return new Promise(async (resolve, reject) => {
                try {
                    let query = query_to_insert_tracking + `(${product_index}, "${is_tracking_stock.max}", "${is_tracking_stock.low}")`
                    let response = await connection.query(query)
                    resolve(true)
                } catch (e) {
                    reject(e)
                }
            })
        } catch (e) {
            reject(e)
        }
    },
    add_product: async function (query_to_add_product, query_to_insert_images, query_to_insert_variant, images, variants, query_to_insert_tracking, is_tracking, is_tracking_stock, query_to_storefront_details, is_featured, sort_order, warranty_information, query_to_insert_custom_fields, custom_fields, query_to_insert_shipping_details, ship_weight, query_to_insert_seo, page_title, product_url, meta_description, query_to_insert_og_sharing, og_title, og_use_description, og_description, is_og_thumbnail, search_keyword, query_to_insert_search, query_to_insert_related_products, related_products) {
        try {
            return new Promise(async (resolve, reject) => {

                let keywords = search_keyword;

                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                connection.query(query_to_add_product, async (err, result, fields) => {
                                    if (err) {
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        let product_index = result.insertId;

                                        connection.query(query_to_storefront_details + `(${product_index}, ${is_featured}, ${sort_order}, '${warranty_information}')`, async (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                connection.query(query_to_insert_shipping_details + `(${product_index}, ${ship_weight})`, async (err, result, fields) => {
                                                    if (err) {
                                                        connection.release();
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        connection.query(query_to_insert_seo + `(${product_index}, '${page_title}', '${product_url}', '${meta_description}')`, async (err, result, fields) => {
                                                            if (err) {
                                                                connection.release();
                                                                let response = {
                                                                    result: err,
                                                                    code: 500
                                                                }
                                                                reject(response)
                                                            } else {
                                                                connection.query(query_to_insert_og_sharing + `(${product_index}, "${og_title}", ${og_use_description}, "${og_description}", ${is_og_thumbnail})`, async (err, result, fields) => {
                                                                    if (err) {
                                                                        connection.release();
                                                                        let response = {
                                                                            result: err,
                                                                            code: 500
                                                                        }
                                                                        reject(response)
                                                                    } else {

                                                                        try {

                                                                            if (is_tracking === true) {
                                                                                let variant_respnse = await self.insert_into_tracking(product_index, query_to_insert_tracking, is_tracking_stock, connection);
                                                                                console.log(variant_respnse)
                                                                            }

                                                                        }
                                                                        catch (e) {
                                                                            let response = {
                                                                                result: e,
                                                                                code: 500
                                                                            }
                                                                            reject(response)
                                                                        }

                                                                        try {

                                                                            if (variants.length != 0) {
                                                                                let variant_respnse = await self.insert_into_variants(product_index, query_to_insert_variant, variants, connection);
                                                                                console.log(variant_respnse)
                                                                            }

                                                                        } catch (e) {
                                                                            let response = {
                                                                                result: e,
                                                                                code: 500
                                                                            }
                                                                            reject(response)
                                                                        }

                                                                        try {

                                                                            if (keywords.length != 0) {
                                                                                let keywords_respnse = await self.insert_into_search_keyword(product_index, query_to_insert_search, keywords, connection);
                                                                                console.log(keywords_respnse)
                                                                            }

                                                                        } catch (e) {
                                                                            let response = {
                                                                                result: e,
                                                                                code: 500
                                                                            }
                                                                            reject(response)
                                                                        }

                                                                        try {
                                                                            if (images.length != 0) {
                                                                                let image_response = await self.insert_into_images(product_index, query_to_insert_images, images, connection);
                                                                                console.log(image_response)
                                                                            }
                                                                        } catch (e) {
                                                                            let response = {
                                                                                result: e,
                                                                                code: 500
                                                                            }
                                                                            reject(response)
                                                                        }

                                                                        try {
                                                                            if (custom_fields.length != 0) {
                                                                                let custom_fields_response = await self.insert_into_custom_fields(product_index, query_to_insert_custom_fields, custom_fields, connection);
                                                                                console.log(custom_fields_response)
                                                                            }
                                                                        } catch (e) {
                                                                            let response = {
                                                                                result: e,
                                                                                code: 500
                                                                            }
                                                                            reject(response)
                                                                        }

                                                                        try {
                                                                            if (related_products.length != 0) {
                                                                                let related_products_response = await self.insert_into_related_products(product_index, query_to_insert_related_products, related_products, connection);
                                                                                console.log(related_products_response)
                                                                            }
                                                                        } catch (e) {
                                                                            let response = {
                                                                                result: e,
                                                                                code: 500
                                                                            }
                                                                            reject(response)
                                                                        }

                                                                        connection.commit((err) => {
                                                                            if (err) {
                                                                                let response = {
                                                                                    result: err,
                                                                                    code: 500
                                                                                }
                                                                                reject(response)
                                                                            } else {
                                                                                connection.release();
                                                                                let response = {
                                                                                    code: 200
                                                                                }
                                                                                resolve(response)
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })

                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
        catch (e) {
            console.log(e)
            return ({
                code: 500,
                message: 'Something went wrong.'
            })
        }
    },
    update_product: async function (product_index, update_product, query_to_insert_variant, query_to_insert_images, images, variants, query_to_insert_tracking, is_tracking, is_tracking_stock, query_to_storefront_details, is_featured, sort_order, warranty_information, query_to_insert_custom_fields, custom_fields, query_to_insert_shipping_details, ship_weight, query_to_insert_seo, page_title, product_url, meta_description, query_to_insert_og_sharing, og_title, og_use_description, og_description, is_og_thumbnail, search_keyword, query_to_insert_search, query_to_insert_related_products, related_products) {
        try {
            return new Promise(async (resolve, reject) => {

                let keywords = search_keyword;

                console.log(keywords)

                pool.getConnection((err, connection) => {
                    if (err) {
                        let response = {
                            result: err,
                            code: 500
                        }
                        reject(response)
                    } else {
                        
                        connection.beginTransaction((err) => {
                            if (err) {
                                connection.release();;
                                let response = {
                                    result: err,
                                    code: 500
                                }
                                reject(response)
                            } else {
                                
                                connection.query(update_product, async (err, result, fields) => {
                                    if (err) {
                                        console.log(err)
                                        connection.release();
                                        let response = {
                                            result: err,
                                            code: 500
                                        }
                                        reject(response)
                                    } else {
                                        
                                        connection.query(`DELETE from sanguine_product_variants where product_index='${product_index}'`, async (err, result, fields) => {
                                            if (err) {
                                                connection.release();
                                                let response = {
                                                    result: err,
                                                    code: 500
                                                }
                                                reject(response)
                                            } else {
                                                
                                                connection.query(`DELETE from sanguine_product_images where product_index='${product_index}'`, async (err, result, fields) => {
                                                    if (err) {
                                                        connection.release();
                                                        let response = {
                                                            result: err,
                                                            code: 500
                                                        }
                                                        reject(response)
                                                    } else {
                                                        
                                                        connection.query(`DELETE from sanguine_product_variants where product_index='${product_index}'`, async (err, result, fields) => {
                                                            if (err) {
                                                                connection.release();
                                                                let response = {
                                                                    result: err,
                                                                    code: 500
                                                                }
                                                                reject(response)
                                                            } else {
                                                                
                                                                connection.query(`DELETE from sanguine_product_inventory where product_index='${product_index}'`, async (err, result, fields) => {
                                                                    if (err) {
                                                                        connection.release();
                                                                        let response = {
                                                                            result: err,
                                                                            code: 500
                                                                        }
                                                                        reject(response)
                                                                    } else {
                                                                        
                                                                        connection.query(`DELETE from sanguine_product_storefront_details where product_index='${product_index}'`, async (err, result, fields) => {
                                                                            if (err) {
                                                                                connection.release();
                                                                                let response = {
                                                                                    result: err,
                                                                                    code: 500
                                                                                }
                                                                                reject(response)
                                                                            } else {
                                                                                
                                                                                connection.query(`DELETE from sanguine_product_custom_fields where product_index='${product_index}'`, async (err, result, fields) => {
                                                                                    if (err) {
                                                                                        connection.release();
                                                                                        let response = {
                                                                                            result: err,
                                                                                            code: 500
                                                                                        }
                                                                                        reject(response)
                                                                                    } else {
                                                                                        
                                                                                        connection.query(`DELETE from sanguine_product_shipping_details where product_index='${product_index}'`, async (err, result, fields) => {
                                                                                            if (err) {
                                                                                                connection.release();
                                                                                                let response = {
                                                                                                    result: err,
                                                                                                    code: 500
                                                                                                }
                                                                                                reject(response)
                                                                                            } else {
                                                                                                
                                                                                                connection.query(`DELETE from sanguine_product_seo where product_index='${product_index}'`, async (err, result, fields) => {
                                                                                                    if (err) {
                                                                                                        connection.release();
                                                                                                        let response = {
                                                                                                            result: err,
                                                                                                            code: 500
                                                                                                        }
                                                                                                        reject(response)
                                                                                                    } else {
                                                                                                        
                                                                                                        connection.query(`DELETE from sanguine_product_og_sharing where product_index='${product_index}'`, async (err, result, fields) => {
                                                                                                            if (err) {
                                                                                                                connection.release();
                                                                                                                let response = {
                                                                                                                    result: err,
                                                                                                                    code: 500
                                                                                                                }
                                                                                                                reject(response)
                                                                                                            } else {
                                                                                                                
                                                                                                                connection.query(`DELETE from sanguine_product_search_keywords where product_index='${product_index}'`, async (err, result, fields) => {
                                                                                                                    if (err) {
                                                                                                                        connection.release();
                                                                                                                        let response = {
                                                                                                                            result: err,
                                                                                                                            code: 500
                                                                                                                        }
                                                                                                                        reject(response)
                                                                                                                    } else {
                                                                                                                        
                                                                                                                        connection.query(`DELETE from sanguine_product_related_products where product_index='${product_index}'`, async (err, result, fields) => {
                                                                                                                            if (err) {
                                                                                                                                connection.release();
                                                                                                                                let response = {
                                                                                                                                    result: err,
                                                                                                                                    code: 500
                                                                                                                                }
                                                                                                                                reject(response)
                                                                                                                            } else {
                                                                                                                                
                                                                                                                                connection.query(query_to_storefront_details + `(${product_index}, ${is_featured}, ${sort_order}, '${warranty_information}')`, async (err, result, fields) => {
                                                                                                                                    if (err) {
                                                                                                                                        connection.release();
                                                                                                                                        let response = {
                                                                                                                                            result: err,
                                                                                                                                            code: 500
                                                                                                                                        }
                                                                                                                                        reject(response)
                                                                                                                                    } else {
                                                                                                                                        
                                                                                                                                        connection.query(query_to_insert_shipping_details + `(${product_index}, ${ship_weight})`, async (err, result, fields) => {
                                                                                                                                            if (err) {
                                                                                                                                                connection.release();
                                                                                                                                                let response = {
                                                                                                                                                    result: err,
                                                                                                                                                    code: 500
                                                                                                                                                }
                                                                                                                                                reject(response)
                                                                                                                                            } else {
                                                                                                                                                connection.query(query_to_insert_seo + `(${product_index}, '${page_title}', '${product_url}', '${meta_description}')`, async (err, result, fields) => {
                                                                                                                                                    if (err) {
                                                                                                                                                        connection.release();
                                                                                                                                                        let response = {
                                                                                                                                                            result: err,
                                                                                                                                                            code: 500
                                                                                                                                                        }
                                                                                                                                                        reject(response)
                                                                                                                                                    } else {
                                                                                                                                                        connection.query(query_to_insert_og_sharing + `(${product_index}, "${og_title}", ${og_use_description}, "${og_description}", ${is_og_thumbnail})`, async (err, result, fields) => {
                                                                                                                                                            if (err) {
                                                                                                                                                                connection.release();
                                                                                                                                                                let response = {
                                                                                                                                                                    result: err,
                                                                                                                                                                    code: 500
                                                                                                                                                                }
                                                                                                                                                                reject(response)
                                                                                                                                                            } else {

                                                                                                                                                                

                                                                                                                                                                try {

                                                                                                                                                                    if (is_tracking === true) {
                                                                                                                                                                        let variant_respnse = await self.insert_into_tracking(product_index, query_to_insert_tracking, is_tracking_stock, connection);
                                                                                                                                                                        console.log(variant_respnse)
                                                                                                                                                                    }

                                                                                                                                                                }
                                                                                                                                                                catch (e) {
                                                                                                                                                                    let response = {
                                                                                                                                                                        result: e,
                                                                                                                                                                        code: 500
                                                                                                                                                                    }
                                                                                                                                                                    reject(response)
                                                                                                                                                                }

                                                                                                                                                                try {
                                                                                                                                                                    if (variants.length != 0) {
                                                                                                                                                                        let variant_respnse = await self.insert_into_variants(product_index, query_to_insert_variant, variants, connection);
                                                                                                                                                                    }
                                                                                                                                                                } catch (e) {
                                                                                                                                                                    let response = {
                                                                                                                                                                        result: e,
                                                                                                                                                                        code: 500
                                                                                                                                                                    }
                                                                                                                                                                    reject(response)
                                                                                                                                                                }

                                                                                                                                                                try {
                                                                                                                                                                    if (images.length != 0) {
                                                                                                                                                                        let image_response = await self.insert_into_images(product_index, query_to_insert_images, images, connection);
                                                                                                                                                                    }
                                                                                                                                                                } catch (e) {
                                                                                                                                                                    let response = {
                                                                                                                                                                        result: e,
                                                                                                                                                                        code: 500
                                                                                                                                                                    }
                                                                                                                                                                    reject(response)
                                                                                                                                                                }

                                                                                                                                                                try {

                                                                                                                                                                    if (keywords.length != 0) {
                                                                                                                                                                        let keywords_respnse = await self.insert_into_search_keyword(product_index, query_to_insert_search, keywords, connection);
                                                                                                                                                                        console.log(keywords_respnse)
                                                                                                                                                                    }

                                                                                                                                                                } catch (e) {
                                                                                                                                                                    let response = {
                                                                                                                                                                        result: e,
                                                                                                                                                                        code: 500
                                                                                                                                                                    }
                                                                                                                                                                    reject(response)
                                                                                                                                                                }

                                                                                                                                                                try {
                                                                                                                                                                    if (custom_fields.length != 0) {
                                                                                                                                                                        let custom_fields_response = await self.insert_into_custom_fields(product_index, query_to_insert_custom_fields, custom_fields, connection);
                                                                                                                                                                        console.log(custom_fields_response)
                                                                                                                                                                    }
                                                                                                                                                                } catch (e) {
                                                                                                                                                                    let response = {
                                                                                                                                                                        result: e,
                                                                                                                                                                        code: 500
                                                                                                                                                                    }
                                                                                                                                                                    reject(response)
                                                                                                                                                                }

                                                                                                                                                                try {
                                                                                                                                                                    if (related_products.length != 0) {
                                                                                                                                                                        let related_products_response = await self.insert_into_related_products(product_index, query_to_insert_related_products, related_products, connection);
                                                                                                                                                                        console.log(related_products_response)
                                                                                                                                                                    }
                                                                                                                                                                } catch (e) {
                                                                                                                                                                    let response = {
                                                                                                                                                                        result: e,
                                                                                                                                                                        code: 500
                                                                                                                                                                    }
                                                                                                                                                                    reject(response)
                                                                                                                                                                }

                                                                                                                                                                

                                                                                                                                                                connection.commit((err) => {
                                                                                                                                                                    if (err) {
                                                                                                                                                                        let response = {
                                                                                                                                                                            result: err,
                                                                                                                                                                            code: 500
                                                                                                                                                                        }
                                                                                                                                                                        reject(response)
                                                                                                                                                                    } else {
                                                                                                                                                                        connection.release();
                                                                                                                                                                        let response = {
                                                                                                                                                                            code: 200
                                                                                                                                                                        }
                                                                                                                                                                        resolve(response)
                                                                                                                                                                    }
                                                                                                                                                                })
                                                                                                                                                            }
                                                                                                                                                        })
                                                                                                                                                    }
                                                                                                                                                })
                                                                                                                                            }
                                                                                                                                        })
                                                                                                                                    }
                                                                                                                                })
                                                                                                                            }
                                                                                                                        })
                                                                                                                    }
                                                                                                                })
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })

                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
        catch (e) {

        }
    },
    fetch_products: async function (query_to_fetch_data) {
        return new Promise(async (resolve, reject) => {
            try {

                let data_send = []

                let products = await self.fetch_data(query_to_fetch_data);

                console.log(query_to_fetch_data)

                if (products.code === 200 && products.result.length > 0) {

                    let prod = products.result

                    async.eachSeries(prod, async function iterateValues(element, callback) {

                        try {

                            let fetch_product_variants = `select p.length_unit, p.discount_type, p.discount_value, p.weight_unit,su1.value as length_unit_value, su2.value as weight_unit_value, p.id as variant_id, p.stock_keeping_unit, p.weight, p.length, p.width, p.height, p.purchasable, p.image, p.price from sanguine_product_variants p left outer join sanguine_units su1 on su1.id=p.length_unit left join sanguine_units su2 on su2.id=p.weight_unit where p.product_index='${element.product_index}'`

                            let variants = await self.fetch_data(fetch_product_variants)

                            if (variants.code === 200 && variants.result.length > 0) {

                                element.variants = variants.result

                            } else {
                                element.variants = [];
                            }

                            let fetch_product_images = `select p.id, p.image, p.description, p.is_thumbnail from sanguine_product_images p where p.product_index=${element.product_index}`

                            let images = await self.fetch_data(fetch_product_images)

                            if (images.code === 200 && images.result.length > 0) {

                                element.images = images.result

                            } else {
                                element.images = [];
                            }

                            let fetch_custom_fields = `select p.name, p.value from sanguine_product_custom_fields p where p.product_index=${element.product_index}`

                            let custom_fields = await self.fetch_data(fetch_custom_fields)

                            if (custom_fields.code === 200 && custom_fields.result.length > 0) {

                                element.custom_fields = custom_fields.result

                            } else {
                                element.custom_fields = [];
                            }

                            let fetch_inventory = `select p.stock, p.sold_stock, p.low_stock from sanguine_product_inventory p where p.product_index=${element.product_index}`

                            let inventory = await self.fetch_data(fetch_inventory)

                            if (inventory.code === 200 && inventory.result.length > 0) {

                                element.inventory = inventory.result

                            } else {
                                element.inventory = [];
                            }

                            let fetch_og = `select p.title, p.use_metadescription, p.metadescription, p.is_thumbnail from sanguine_product_og_sharing p where p.product_index=${element.product_index}`

                            let og = await self.fetch_data(fetch_og)

                            if (og.code === 200 && og.result.length > 0) {

                                element.og = og.result

                            } else {
                                element.og = [];
                            }

                            let fetch_seo = `select p.page_title, p.product_url, p.meta_description from sanguine_product_seo p where p.product_index=${element.product_index}`

                            let seo = await self.fetch_data(fetch_seo)

                            if (seo.code === 200 && seo.result.length > 0) {

                                element.seo = seo.result

                            } else {
                                element.seo = [];
                            }

                            let fetch_ship = `select p.weight from sanguine_product_shipping_details p where p.product_index=${element.product_index}`

                            let shipping_weight = await self.fetch_data(fetch_ship)

                            if (shipping_weight.code === 200 && shipping_weight.result.length > 0) {

                                element.shipping_weight = shipping_weight.result

                            } else {
                                element.shipping_weight = [];
                            }

                            let fetch_storefront = `select p.is_featured, p.sort_order, p.warranty_information from sanguine_product_storefront_details p where p.product_index=${element.product_index}`

                            let storefront = await self.fetch_data(fetch_storefront)

                            if (storefront.code === 200 && storefront.result.length > 0) {

                                element.storefront = storefront.result

                            } else {
                                element.storefront = [];
                            }

                            let fetch_related_products = `select p.realted_product_index from sanguine_product_related_products p where p.product_index=${element.product_index}`

                            let related_products = await self.fetch_data(fetch_related_products)

                            if (related_products.code === 200 && related_products.result.length > 0) {

                                element.related_products = related_products.result

                            } else {
                                element.related_products = [];
                            }

                            let fetch_search_keywords = `select p.keyword from sanguine_product_search_keywords p where p.product_index=${element.product_index}`

                            let search_keywords = await self.fetch_data(fetch_search_keywords)

                            if (search_keywords.code === 200 && search_keywords.result.length > 0) {

                                element.search_keywords = search_keywords.result

                            } else {
                                element.search_keywords = [];
                            }


                            if (element === prod[prod.length - 1]) {
                                resolve({ code: 200, data: products })
                            }
                            callback
                        }
                        catch (e) {
                            console.log(e)
                        }


                    })

                } else {
                    resolve({ ...data_send })
                }

            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    },
}


