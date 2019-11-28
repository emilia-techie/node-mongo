let router = require('express').Router();
let controller = require('./controller');
const jwtVerification = require('../../middlewares/jwt').jwtVerification;

router.post('/product', jwtVerification, controller.addProduct);
router.get('/products', controller.getProducts);
router.get('/product/:productId', controller.getProduct);
router.get('/filter-product/:productCategory', controller.FilterProductByCategory);
router.get('/filter-product-name/:productName', controller.FilterProductByName);

router.put('/product/:productId', jwtVerification, controller.updateProduct);
router.delete('/product/:productId', jwtVerification, controller.deleteProduct);

module.exports = router;