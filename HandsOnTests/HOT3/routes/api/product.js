import express from 'express';
const router = express.Router();

import debug from 'debug';
import { validId } from '../../middleware/validid.js';
import { validBody } from '../../middleware/validBody.js';
import { hasRole } from '@merlin4/express-auth';

import {
  getAllProducts,
  getProductById,
  createProduct,
  getProductByName,
  updateProduct,
  deleteProduct,
} from '../../database.js';

const debugProducts = debug('app:product');

import Joi from 'joi';

router.use(express.urlencoded({ extended: false }));

const newProductSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number(),
  category: Joi.string(),
  description: Joi.string(),
});

// Get all products
router.get('', async (req, res, next) => {
  try {
    let products = await getAllProducts();

    // Get products search query
    const { category, maxPrice, minPrice, sortBy, pageSize, pageNumber } = req.query;

    if (category) {
      products = products.filter((product) => product.category === category);
      debugProducts(`Category: ${category}`);
    }

    if (maxPrice || minPrice) {
      products = products.filter((product) => {
        if (maxPrice && minPrice) {
          return product.price >= minPrice && product.price <= maxPrice;
        } else if (maxPrice) {
          return product.price <= maxPrice;
        } else {
          return product.price >= minPrice;
        }
      });
      debugProducts(`Max Price: ${maxPrice} Min Price: ${minPrice}`);
    }

    const allowedSorts = ['name', 'maxPrice', 'minPrice', 'category', 'newest'];
    if (sortBy && allowedSorts.includes(sortBy)) {
      switch (sortBy) {
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'maxPrice':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'minPrice':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'category':
          products.sort((a, b) => a.category.localeCompare(b.category));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
          break;
      }
    }

    const page = parseInt(pageNumber) || 1;
    const limit = parseInt(pageSize) || 5;
    const skip = (page - 1) * limit;

    products = products.slice(skip, skip + limit);
    debugProducts(`Page: ${page}, Page Size: ${limit}`);

    res.status(200).json(products);
    debugProducts(`Products rote hit!`);
  } catch (err) {
    res.status(500).send(err);
    debugProducts(`Error getting products: ${err.message}`);
  }
});

// Get Product by ID
router.get('/:productId', validId('productId'), async (req, res, next) => {
  const productId = req.productId;
  debugProducts(`Product id: ${productId}`);
  try {
    if (productId) {
      const product = await getProductById(productId);
      res.status(200).json(product);
      debugProducts(`Products ID rote hit!`);
    } else {
      res.status(404).json(` Product ${productId} not found}`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get Product by Name
router.get('/name/:productName', async (req, res, next) => {
  const productName = req.params.productName;
  debugProducts(`Product Name: ${productName}`);
  try {
    if (productName) {
      const product = await getProductByName(productName);
      res.status(200).json(product);
      debugProducts(`Products Name rote hit!`);
    } else {
      res.status(404).json(` Product ${productName} not found}`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create new product
router.post('', hasRole('Admin'), validBody(newProductSchema), async (req, res, next) => {
  const newProduct = req.body;
  debugProducts(`New Product: ${JSON.stringify(newProduct)}`);

  try {
    newProduct.createdOn = new Date();
    newProduct.lastUpdatedOn = new Date();
    const results = await createProduct(newProduct);
    debugProducts(`Product Created: ${JSON.stringify(results)}`);
    res.status(200).json({ message: `New product registered!, ${results.insertedId}` });
    debugProducts(`New product rote hit!`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update Product by ID
router.patch(
  '/:productId',
  hasRole('Admin'),
  validId('productId'),
  validBody(updateProductSchema),
  async (req, res, next) => {
    const productId = req.productId;
    const updatedProduct = req.body;
    debugProducts(`Product id: ${productId}`);
    debugProducts(`Updated Product: ${JSON.stringify(updatedProduct)}`);
    try {
      const product = await getProductById(productId);
      debugProducts(`Product: ${JSON.stringify(product)}`);
      if (product) {
        const results = await updateProduct(productId, updatedProduct);
        debugProducts(`Product Updated: ${JSON.stringify(results)}`);
        res.status(200).json({ message: `Product Updated!, ${(results, productId)}` });
        debugProducts(`Product Update rote hit!`);
      } else {
        res.status(400).json(` Product ${productId} not found}`);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Delete Product by ID
router.delete('/:productId', hasRole('Admin'), validId('productId'), async (req, res, next) => {
  const productId = req.productId;
  debugProducts(`Product id: ${productId}`);
  try {
    const product = await getProductById(productId);
    debugProducts(`Product: ${JSON.stringify(product)}`);
    if (product) {
      const results = await deleteProduct(productId);
      debugProducts(`Product Deleted: ${JSON.stringify(results)}`);
      res.status(200).json({ message: `Product Deleted!, ${productId}` });
      debugProducts(`Product Delete rote hit!`);
    } else {
      res.status(400).json(` Product ${productId} not found}`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export { router as productsRouter };
