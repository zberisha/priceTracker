const categoryService = require('../services/category.service');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.user._id, req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.user._id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.user._id, req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.user._id, req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
