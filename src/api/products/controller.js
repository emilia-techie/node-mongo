const { sendErrorResponse, sendSuccessResponse, manageValidationMessages, generateRandomString } = require('../../helpers/utility');
var async = require('async');
/*Product schema */
const Product = require('mongoose').model('Product');

/*add Product*/
exports.addProduct = (req, res, next) => {
    let productName = req.body.productName;
    let productCategory = req.body.productCategory;
    let brand = req.body.brand;
    let price = req.body.price;
    let size = req.body.size;
    let ratings = req.body.ratings;
    let userComments = req.body.userComments;
    let colour = req.body.colour;
    let description = req.body.description;
    let userId = req.userId; //Get userId from JWT
    /*Manage validation*/
    req.check('productName', 'Enter productName!').notEmpty();
    req.check('productName', 'Product name length should be between 3 to 25!').isLength({ min: 3, max: 25 });
    req.check('productCategory', 'Enter productCategory!').notEmpty();
    req.check('productCategory', 'Invalid value for product category, currently we have two categories ie Indian or Western! ').isIn(['Indian', 'Western'])
    req.check('brand', 'Enter brand!').notEmpty();
    req.check('price', 'Enter price!').notEmpty();
    req.check('size', 'Enter size!').notEmpty();
    req.check('ratings', 'Enter ratings!').notEmpty();
    req.check('colour', 'Enter colour!').notEmpty();
    req.check('description', 'Enter description!').notEmpty();
    req.check('userComments', 'Enter userComments!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "success": false,
            "message": manageValidationMessages(errors)
        });
    } else {
        let productTitle = productName.trim();
        async.waterfall([
            function(callback) {
                Product.findOne({ $and: [{ productName: productTitle }, { brand: brand }, { productCategory: productCategory }, { size: size }, { colour: colour }, { price: price }] }, (err, result) => {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (result) {
                        return sendErrorResponse(res, {}, "Product already exists!");
                    } else {
                        callback(null, result);
                    }
                })
            }
        ], function(err, result) {
            let addObj = new Product();
            let productId = generateRandomString("PRODUCT");
            addObj.userId = userId;
            addObj.productId = productId;
            addObj.productName = productTitle;
            addObj.productCategory = productCategory;
            addObj.brand = brand;
            addObj.size = size;
            addObj.colour = colour;
            addObj.price = price;
            addObj.ratings = ratings;
            addObj.userComments = userComments;
            addObj.description = description;
            addObj.createdAt = new Date();
            addObj.updatedAt = new Date();
            addObj.save((err, docx) => {
                if (err) return sendErrorResponse(res, {}, { error: err.message });
                if (!docx) return sendErrorResponse(res, {}, 'There is some problem while adding product details, please try again later!');
                if (docx) {
                    return sendSuccessResponse(res, docx, 'Prodcut has been added successfully!');
                }
            });
        });
    }
}

/*Get all products(Sorted by date)*/
exports.getProducts = (req, res, next) => {
    Product.find({}, (err, result) => {
        if (err) return sendErrorResponse(res, {}, { error: err.message });
        if (result.length > 0) {
            return sendSuccessResponse(res, result, "Product list found!");
        } else {
            return sendErrorResponse(res, {}, "No data found!");
        }
    }).sort({ createdAt: -1 });
}

/*Filter products by product category*/
exports.FilterProductByCategory = (req, res, next) => {
    let productCategory = req.params.productCategory;
    productCategory = productCategory.trim();
    Product.find({ productCategory: productCategory }, (err, result) => {
        if (err) return sendErrorResponse(res, {}, { error: err.message });
        if (result.length > 0) {
            return sendSuccessResponse(res, result, "Product list of " + productCategory + " category!");
        } else {
            return sendErrorResponse(res, {}, "No data found for " + productCategory + " category!");
        }
    }).sort({ createdAt: -1 });
}

/*Filter products by product name*/
exports.FilterProductByName = (req, res, next) => {
    let productName = req.params.productName;
    productName = productName.trim();
    Product.find({ productName: { $regex: '.*' + productName + '.*' } }, (err, result) => {
        if (err) return sendErrorResponse(res, {}, { error: err.message });
        if (result.length > 0) {
            return sendSuccessResponse(res, result, "Product list of " + productName + "!");
        } else {
            return sendErrorResponse(res, {}, "No data found for " + productName + "!");
        }
    }).sort({ createdAt: -1 });
}

/*Get Product by productId */
exports.getProduct = (req, res, next) => {
    let productId = req.params.productId;
    Product.findOne({ productId: productId }, (err, result) => {
        if (err) return sendErrorResponse(res, {}, { error: err.message });
        if (result) {
            return sendSuccessResponse(res, result, "Product details found!");
        } else {
            return sendErrorResponse(res, {}, "No data found!");
        }
    })
}

/*Update Product*/
exports.updateProduct = (req, res, next) => {
    let productId = req.params.productId;
    let productName = req.body.productName;
    let productCategory = req.body.productCategory;
    let brand = req.body.brand;
    let price = req.body.price;
    let size = req.body.size;
    let colour = req.body.colour;
    let ratings = req.body.ratings;
    let userComments = req.body.userComments;
    let description = req.body.description;
    let userId = req.userId; //Get userId from JWT 
    /*Manage validation*/
    req.check('productName', 'Enter productName!').notEmpty();
    req.check('productName', 'Product name length should be between 3 to 25!').isLength({ min: 3, max: 25 });
    req.check('productCategory', 'Enter productCategory!').notEmpty();
    req.check('productCategory', 'Invalid value for product category, currently we have two categories ie Indian or Western! ').isIn(['Indian', 'Western'])
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "success": false,
            "message": manageValidationMessages(errors)
        });
    } else {
        async.waterfall([
            function(callback) {
                Product.findOne({ $and: [{ productId: productId }, { userId: userId }] }, function(err, result) {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (!result) return sendErrorResponse(res, {}, 'No data found!');
                    if (result) {
                        callback(null, result);
                    }
                });
            },
        ], function(err, ProductResult) {
            ProductResult.productName = productName;
            ProductResult.productCategory = productCategory ? productCategory : ProductResult.productCategory;
            ProductResult.brand = brand ? brand : ProductResult.brand;
            ProductResult.price = price ? price : ProductResult.price;
            ProductResult.size = size ? size : ProductResult.size;
            ProductResult.colour = colour ? colour : ProductResult.colour;
            ProductResult.ratings = ratings ? ratings : ProductResult.ratings;
            ProductResult.userComments = userComments ? userComments : ProductResult.userComments;
            ProductResult.description = description ? description : ProductResult.description;
            ProductResult.updatedAt = new Date();
            Product.updateOne({ productId: productId }, { $set: ProductResult }, (err, result) => {
                if (err) return sendErrorResponse(res, {}, { error: err.message });
                if (!result) return sendErrorResponse(res, {}, 'There is some problem while updating Product, please try again later!');
                if (result) {
                    return sendSuccessResponse(res, {}, 'Your Product has been updated successfully!');
                }
            });
        });
    }
}

/*Hard delete*/
exports.deleteProduct = (req, res, next) => {
    let userId = req.userId; //Get userId from JWT
    let productId = req.params.productId;
    async.waterfall([
        function(callback) {
            Product.findOne({ $and: [{ productId: productId }, { userId: userId }] }, (err, result) => {
                if (err) return sendErrorResponse(res, {}, { error: err.message });
                if (result) {
                    callback(null, result);
                } else {
                    return sendErrorResponse(res, {}, "No data found!")
                };
            })
        }
    ], function(err, ProductResult) {
        Product.deleteOne({ $and: [{ productId: productId }, { userId: userId }] }, (err, result) => {
            if (err) return sendErrorResponse(res, {}, { error: err.message });
            if (result) {
                return sendErrorResponse(res, {}, "Product has been deleted successfully!")
            }
        })
    })
}