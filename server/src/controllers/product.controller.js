const productService = require('../services/product.service');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.user._id, req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.user._id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.user._id, req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.user._id, req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.user._id, req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

const getPriceHistory = async (req, res, next) => {
  try {
    const prices = await productService.getPriceHistory(req.params.id, req.query);
    res.json(prices);
  } catch (error) {
    next(error);
  }
};

const scrapeNow = async (req, res, next) => {
  try {
    const result = await productService.scrapeNow(req.user._id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const exportPriceHistory = async (req, res, next) => {
  try {
    const { filename, csv } = await productService.exportPriceHistoryCsv(req.user._id, req.params.id, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getPriceHistory, scrapeNow, exportPriceHistory };
