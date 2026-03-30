const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const createCategory = async (userId, data) => {
  const exists = await Category.findOne({ user: userId, name: data.name, isActive: true });
  if (exists) throw new AppError('Category already exists', 409);

  const softDeleted = await Category.findOne({ user: userId, name: data.name, isActive: false });
  if (softDeleted) {
    softDeleted.isActive = true;
    await softDeleted.save();
    return softDeleted;
  }

  return Category.create({ ...data, user: userId });
};

const getCategories = async (userId) => {
  return Category.find({ user: userId, isActive: true }).sort({ name: 1 });
};

const updateCategory = async (userId, categoryId, updates) => {
  if (updates.name) {
    const dup = await Category.findOne({ user: userId, name: updates.name, isActive: true, _id: { $ne: categoryId } });
    if (dup) throw new AppError('Category name already exists', 409);
  }
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, user: userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const deleteCategory = async (userId, categoryId) => {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, user: userId },
    { isActive: false },
    { new: true }
  );
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
