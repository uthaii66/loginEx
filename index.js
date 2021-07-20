import express from 'express';
import userController from '../routes/user.controller.js';
import productController from '../routes/product.controller.js'

const router = express.Router();


router.use('/users', userController);
router.use('/product', productController);


export default router



