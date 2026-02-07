const alertService = require('../services/alert.service');

const createAlert = async (req, res, next) => {
  try {
    const alert = await alertService.createAlert(req.user._id, req.body);
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const result = await alertService.getAlerts(req.user._id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const alert = await alertService.markAsRead(req.user._id, req.params.id);
    res.json(alert);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await alertService.markAllAsRead(req.user._id);
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    await alertService.deleteAlert(req.user._id, req.params.id);
    res.json({ message: 'Alert removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAlert, getAlerts, markAsRead, markAllAsRead, deleteAlert };
