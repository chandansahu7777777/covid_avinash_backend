const jwt = require('jsonwebtoken');
const environment = process.env.NODE_ENV;
const stage = require('../config')[environment];
const secret = stage.JWT_SECRET;
var pool = require('../model/mysql_connection');
const DatabaseService = require('../services/DatabaseService');
const ServerResponse = require('../response');
const { body, validationResult } = require('express-validator');

module.exports = {
    productAddValidator: [
        body('product_name')
            .exists({ checkFalsy: true, checkNull: true })
            .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
            .trim(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A1",
                    message: 'Invalid Name',
                });
            }
            next()
        },
        body('product_description')
            .exists({ checkFalsy: true, checkNull: true })
            .isLength({ min: 1 }).withMessage('Should not be empty')
            .trim(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A2",
                    message: 'Invalid Description',
                });
            }
            next()
        },
        body('stock_keeping_unit')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_products where stock_keeping_unit='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 1) {
                    throw new Error('SKU Already Used');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A3", message: 'Invalid SKU' });
            }
            next()
        },
        // body('weight')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A4",
        //             message: 'Invalid Weight',
        //         });
        //     }
        //     next()
        // },
        // body('length')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A5",
        //             message: 'Invalid Length',
        //         });
        //     }
        //     next()
        // },
        // body('width')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A6",
        //             message: 'Invalid Width',
        //         });
        //     }
        //     next()
        // },
        // body('height')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A7",
        //             message: 'Invalid Height',
        //         });
        //     }
        //     next()
        // },
        body('weight_unit')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    throw new Error('Weight Unit Doesnot Exist');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A8", message: 'Invalid Weight Unit' });
            }
            next()
        },
        body('length_unit')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    throw new Error('Length Unit Doesnot Exist');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A9", message: 'Invalid Length Unit' });
            }
            next()
        },
        body('brand')
            .custom(async (value, { req }) => {
                let check = `select * from brand where row_id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    req.body.brand = 38
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A10", message: 'Invalid Brand' });
            }
            next()
        },
        body('category')
            .custom(async (value, { req }) => {
                let check = `select * from product_categories where row_id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    throw new Error('Category Doesnot Exist');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A11", message: 'Invalid Category' });
            }
            next()
        },
        body('price')
            .exists({ checkFalsy: true, checkNull: true }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A12", message: 'Invalid Price'
                });
            }
            next()
        },
        body('is_visible')
            .isBoolean(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A13", message: 'Invalid Visibility Type'
                });
            }
            next()
        },
        body('variants')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A14", message: 'Invalid Variant'
                });
            }
            next()
        },
        body('images')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A15", message: 'Invalid Images'
                });
            }
            next()
        },
        body('variants.*')
            .custom(async (a, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${a.weight_unit}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && a.weight_unit != 0) {
                    throw new Error('Weight Unit Doesnot Exist');
                } else {
                    return true;
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A16", message: 'Invalid Weight Unit for variant'
                });
            }
            next()
        },
        body('variants.*')
            .custom(async (a, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${a.length_unit}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && a.length_unit != 0) {
                    throw new Error('Dimension Unit Doesnot Exist');
                } else {
                    return true;
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A17", message: 'Invalid Length Unit for variant'
                });
            }
            next()
        },
        body('variants.*')
            .custom(async (a, { req }) => {
                if (a.stock_keeping_unit != undefined && a.stock_keeping_unit.toString() === '') {
                    return true
                } else {
                    let check = `select * from sanguine_product_variants where stock_keeping_unit='${a.stock_keeping_unit}'`
                    let response = await DatabaseService.check_status_for_existence_in_database(check)
                    if (response === 1) {
                        throw new Error('Stock keeping Unit Already Exist');
                    } else {
                        return true;
                    }
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A18", message: 'Invalid SKU for variant'
                });
            }
            next()
        },
        body('discount_type')
            .exists({ checkFalsy: true, checkNull: true }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A19", message: 'Invalid Discount Type'
                });
            }
            next()
        },
        // body('discount_value')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A20", message: 'Invalid Discount Value'
        //         });
        //     }
        //     next()
        // },
        body('variants.*')
            .custom(async (a, { req }) => {
                if (a.discount_type != 'percentage' && a.discount_type != 'amount') {
                    throw new Error('Stock keeping Unit Already Exist');
                } else {
                    if (a.discount_type.toString().trim().toLowerCase() === 'percentage') {
                        if (parseFloat(a.discount_value) > 100.00) {
                            throw new Error('Stock keeping Unit Already Exist');
                        } else {
                            return true
                        }
                    } else if (a.discount_type.toString().trim().toLowerCase() === 'amount') {
                        if (parseFloat(a.discount_value) > parseFloat(a.price)) {
                            throw new Error('Stock keeping Unit Already Exist');
                        } else {
                            return true
                        }
                    } else {
                        throw new Error('Stock keeping Unit Already Exist');
                    }
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A21", message: 'Invalid Discount Parameters In Variants'
                });
            }
            next()
        },
        body('is_tracking')
            .isBoolean(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A22", message: 'Invalid Tracking Check'
                });
            }
            next()
        },
        body('is_tracking_stock.max')
            .custom(async (value, { req }) => {
                let tracking = req.body.is_tracking;
                if (tracking === false) {
                    return true;
                } else {
                    if (value != null && value != undefined && parseInt(value) != undefined && parseInt(value) != null) {
                        req.body.is_tracking.max = parseInt(value)
                        return true
                    } else {
                        throw new Error('Max Stock Invalid')
                    }
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A23", message: 'Invalid Max Stock' });
            }
            next()
        },
        body('is_tracking_stock.low')
            .custom(async (value, { req }) => {
                let tracking = req.body.is_tracking;
                if (tracking === false) {
                    return true;
                } else {
                    if (value != null && value != undefined && parseInt(value) != undefined && parseInt(value) != null) {
                        req.body.is_tracking_stock.low = parseInt(value)
                        return true
                    } else {
                        throw new Error('Max Stock Invalid')
                    }
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A24", message: 'Invalid Low Stock' });
            }
            next()
        },
        body('is_featured')
            .isBoolean(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A25", message: 'Invalid Featured Type'
                });
            }
            next()
        },
        body('search_keyword')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A26",
                    message: 'Invalid Search Keyword',
                });
            }
            next()
        },
        body('sort_order')
            .exists({ checkFalsy: false, checkNull: true })
            .toInt(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A27", message: 'Invalid Sort Order'
                });
            }
            next()
        },
        // body('warranty_information')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A28",
        //             message: 'Invalid Warranty Information',
        //         });
        //     }
        //     next()
        // },
        body('custom_fields')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A29", message: 'Invalid Custom Fields'
                });
            }
            next()
        },
        body('custom_fields.*')
            .custom(async (a, { req }) => {
                if (a.name != null && a.value != undefined && a.value != null && a.value != undefined && a.name != "" && a.value != "") {
                    return true
                } else {
                    throw new Error('Custom Field Error')
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A30", message: 'Invalid Custom Fields'
                });
            }
            next()
        },
        body('ship_weight')
            .exists({ checkFalsy: true, checkNull: true })
            .toFloat(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A31", message: 'Invalid Weight For Dimension'
                });
            }
            next()
        },
        // body('page_title')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A32",
        //             message: 'Invalid Page Title',
        //         });
        //     }
        //     next()
        // },
        body('product_url')
            .exists({ checkFalsy: true, checkNull: true })
            .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
            .trim(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A32",
                    message: 'Invalid Product URL',
                });
            }
            next()
        },
        // body('meta_description')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A33",
        //             message: 'Invalid Meta Description',
        //         });
        //     }
        //     next()
        // },
        // body('og_title')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A34",
        //             message: 'Invalid OG Title',
        //         });
        //     }
        //     next()
        // },
        // body('og_description')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A35",
        //             message: 'Invalid OG Description',
        //         });
        //     }
        //     next()
        // },
        // body('is_og_thumbnail')
        //     .isBoolean(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A36", message: 'Invalid OG Thumbnail Type'
        //         });
        //     }
        //     next()
        // },
        // body('og_use_description')
        //     .isBoolean(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A37", message: 'Invalid OG Use Description Type'
        //         });
        //     }
        //     next()
        // },
        body('related_products')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A38", message: 'Invalid Related Products'
                });
            }
            next()
        },
        body('related_products.*')
            .custom(async (a, { req }) => {
                let check = `select * from sanguine_products where id='${a}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0) {
                    throw new Error('Invalid Related Products');
                } else {
                    return true;
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A39", message: 'Invalid Related Products'
                });
            }
            next()
        },
    ],
    productUpdateValidator: [
        body('product_name')
            .exists({ checkFalsy: true, checkNull: true })
            .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
            .trim(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A1",
                    message: 'Invalid Name',
                });
            }
            next()
        },
        body('product_description')
            .exists({ checkFalsy: true, checkNull: true })
            .isLength({ min: 1 }).withMessage('Should not be empty')
            .trim(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A2",
                    message: 'Invalid Description',
                });
            }
            next()
        },
        body('stock_keeping_unit')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_products where stock_keeping_unit='${value}' and id<>${parseInt(req.params.id)}`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 1) {
                    throw new Error('SKU Already Used');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A3", message: 'Invalid SKU' });
            }
            next()
        },
        // body('weight')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A4",
        //             message: 'Invalid Weight',
        //         });
        //     }
        //     next()
        // },
        // body('length')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A5",
        //             message: 'Invalid Length',
        //         });
        //     }
        //     next()
        // },
        // body('width')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A6",
        //             message: 'Invalid Width',
        //         });
        //     }
        //     next()
        // },
        // body('height')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A7",
        //             message: 'Invalid Height',
        //         });
        //     }
        //     next()
        // },
        body('weight_unit')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    throw new Error('Weight Unit Doesnot Exist');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A8", message: 'Invalid Weight Unit' });
            }
            next()
        },
        body('length_unit')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    throw new Error('Length Unit Doesnot Exist');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A9", message: 'Invalid Length Unit' });
            }
            next()
        },
        body('brand')
            .custom(async (value, { req }) => {
                let check = `select * from brand where row_id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    req.body.brand = 38
                } else {
                    req.body.brand = 38
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A10", message: 'Invalid Brand' });
            }
            next()
        },
        body('category')
            .custom(async (value, { req }) => {
                let check = `select * from product_categories where row_id='${value}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && value != 0) {
                    throw new Error('Category Doesnot Exist');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A11", message: 'Invalid Category' });
            }
            next()
        },
        body('price')
            .exists({ checkFalsy: true, checkNull: true }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A12", message: 'Invalid Price'
                });
            }
            next()
        },
        body('is_visible')
            .isBoolean(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A13", message: 'Invalid Visibility Type'
                });
            }
            next()
        },
        body('variants')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A14", message: 'Invalid Variant'
                });
            }
            next()
        },
        body('images')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A15", message: 'Invalid Images'
                });
            }
            next()
        },
        body('variants.*')
            .custom(async (a, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${a.weight_unit}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && a.weight_unit != 0) {
                    throw new Error('Weight Unit Doesnot Exist');
                } else {
                    return true;
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A16", message: 'Invalid Weight Unit for variant'
                });
            }
            next()
        },
        body('variants.*')
            .custom(async (a, { req }) => {
                let check = `select * from sanguine_units where sanguine_units.id='${a.length_unit}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0 && a.length_unit != 0) {
                    throw new Error('Dimension Unit Doesnot Exist');
                } else {
                    return true;
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A17", message: 'Invalid Length Unit for variant'
                });
            }
            next()
        },
        body('variants.*')
            .custom(async (a, { req }) => {
                if (a.variant_id == null || a.variant == '') {
                    a.variant_id = 0
                }

                if (a.stock_keeping_unit != undefined && a.stock_keeping_unit.toString() === '') {
                    return true
                } else {
                    let check = `select * from sanguine_product_variants where stock_keeping_unit='${a.stock_keeping_unit}' and id<>${parseInt(a.variant_id)}`
                    console.log(check)
                    let response = await DatabaseService.check_status_for_existence_in_database(check)
                    console.log(check)
                    if (response === 1) {
                        throw new Error('Stock keeping Unit Already Exist');
                    } else {
                        return true;
                    }
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A18", message: 'Invalid SKU for variant'
                });
            }
            next()
        },
        body('discount_type')
            .exists({ checkFalsy: true, checkNull: true }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A19", message: 'Invalid Discount Type'
                });
            }
            next()
        },
        // body('discount_value')
        //     .exists({ checkFalsy: true, checkNull: true }),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A20", message: 'Invalid Discount Value'
        //         });
        //     }
        //     next()
        // },
        body('variants.*')
            .custom(async (a, { req }) => {
                if (a.discount_type != 'percentage' && a.discount_type != 'amount') {
                    throw new Error('Stock keeping Unit Already Exist');
                } else {
                    if (a.discount_type.toString().trim().toLowerCase() === 'percentage') {
                        if (parseFloat(a.discount_value) > 100.00) {
                            throw new Error('Stock keeping Unit Already Exist');
                        } else {
                            return true
                        }
                    } else if (a.discount_type.toString().trim().toLowerCase() === 'amount') {
                        if (parseFloat(a.discount_value) > parseFloat(a.price)) {
                            throw new Error('Stock keeping Unit Already Exist');
                        } else {
                            return true
                        }
                    } else {
                        throw new Error('Stock keeping Unit Already Exist');
                    }
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A21", message: 'Invalid Discount Parameters In Variants'
                });
            }
            next()
        },
        body('is_tracking')
            .isBoolean(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A22", message: 'Invalid Tracking Check'
                });
            }
            next()
        },
        body('is_tracking_stock.max')
            .custom(async (value, { req }) => {
                let tracking = req.body.is_tracking;
                if (tracking === false) {
                    return true;
                } else {
                    if (value != null && value != undefined && parseInt(value) != undefined && parseInt(value) != null) {
                        req.body.is_tracking.max = parseInt(value)
                        return true
                    } else {
                        throw new Error('Max Stock Invalid')
                    }
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A23", message: 'Invalid Max Stock' });
            }
            next()
        },
        body('is_tracking_stock.low')
            .custom(async (value, { req }) => {
                let tracking = req.body.is_tracking;
                if (tracking === false) {
                    return true;
                } else {
                    if (value != null && value != undefined && parseInt(value) != undefined && parseInt(value) != null) {
                        req.body.is_tracking_stock.low = parseInt(value)
                        return true
                    } else {
                        throw new Error('Max Stock Invalid')
                    }
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A24", message: 'Invalid Low Stock' });
            }
            next()
        },
        body('is_featured')
            .isBoolean(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A25", message: 'Invalid Featured Type'
                });
            }
            next()
        },
        body('search_keyword')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A26",
                    message: 'Invalid Search Keyword',
                });
            }
            next()
        },
        body('sort_order')
            .exists({ checkFalsy: false, checkNull: true })
            .toInt(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A27", message: 'Invalid Sort Order'
                });
            }
            next()
        },
        // body('warranty_information')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A28",
        //             message: 'Invalid Warranty Information',
        //         });
        //     }
        //     next()
        // },
        body('custom_fields')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A29", message: 'Invalid Custom Fields'
                });
            }
            next()
        },
        body('custom_fields.*')
            .custom(async (a, { req }) => {
                if (a.name != null && a.value != undefined && a.value != null && a.value != undefined && a.name != "" && a.value != "") {
                    return true
                } else {
                    throw new Error('Custom Field Error')
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A30", message: 'Invalid Custom Fields'
                });
            }
            next()
        },
        body('ship_weight')
            .exists({ checkFalsy: true, checkNull: true })
            .toFloat(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A31", message: 'Invalid Weight For Dimension'
                });
            }
            next()
        },
        // body('page_title')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A32",
        //             message: 'Invalid Page Title',
        //         });
        //     }
        //     next()
        // },
        body('product_url')
            .exists({ checkFalsy: true, checkNull: true })
            .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
            .trim(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A32",
                    message: 'Invalid Product URL',
                });
            }
            next()
        },
        // body('meta_description')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A33",
        //             message: 'Invalid Meta Description',
        //         });
        //     }
        //     next()
        // },
        // body('og_title')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A34",
        //             message: 'Invalid OG Title',
        //         });
        //     }
        //     next()
        // },
        // body('og_description')
        //     .exists({ checkFalsy: true, checkNull: true })
        //     .isLength({ min: 1, max: 50 }).withMessage('Should not be empty')
        //     .trim(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A35",
        //             message: 'Invalid OG Description',
        //         });
        //     }
        //     next()
        // },
        // body('is_og_thumbnail')
        //     .isBoolean(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A36", message: 'Invalid OG Thumbnail Type'
        //         });
        //     }
        //     next()
        // },
        // body('og_use_description')
        //     .isBoolean(),
        // function (req, res, next) {
        //     var errorValidation = validationResult(req);
        //     if (!errorValidation.isEmpty()) {
        //         return res.status(400).json({
        //             code: "A37", message: 'Invalid OG Use Description Type'
        //         });
        //     }
        //     next()
        // },
        body('related_products')
            .exists({ checkFalsy: true, checkNull: true })
            .isArray(),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A38", message: 'Invalid Related Products'
                });
            }
            next()
        },
        body('related_products.*')
            .custom(async (a, { req }) => {
                let check = `select * from sanguine_products where id='${a}'`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 0) {
                    throw new Error('Invalid Related Products');
                } else {
                    return true;
                }
            }).withMessage('Invalid'),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A39", message: 'Invalid Related Products'
                });
            }
            next()
        },
    ],
    skuCheckProduct: [
        body('sku')
            .exists({ checkFalsy: true, checkNull: true }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A5",
                    message: 'Invalid Length',
                });
            }
            next()
        },
        body('sku')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_products where stock_keeping_unit='${value}' and id<>${parseInt(req.params.id)}`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 1) {
                    throw new Error('SKU Already Used');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A3", message: 'Invalid SKU' });
            }
            next()
        },
    ],
    skuCheckProductVariant: [
        body('sku')
            .exists({ checkFalsy: true, checkNull: true }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({
                    code: "A5",
                    message: 'Invalid Length',
                });
            }
            next()
        },
        body('sku')
            .custom(async (value, { req }) => {
                let check = `select * from sanguine_product_variants where stock_keeping_unit='${value}' and id<>${parseInt(req.params.id)}`
                let response = await DatabaseService.check_status_for_existence_in_database(check)
                if (response === 1) {
                    throw new Error('SKU Already Used');
                } else {
                    return true;
                }
            }),
        function (req, res, next) {
            var errorValidation = validationResult(req);
            if (!errorValidation.isEmpty()) {
                return res.status(400).json({ code: "A3", message: 'Invalid SKU' });
            }
            next()
        },
    ]
};
