const adminService = require('../services/admin.service');

const getKpis = async (req, res, next) => {
  try {
    const kpis = await adminService.getKpis();
    res.json(kpis);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const changeUserPlan = async (req, res, next) => {
  try {
    const sub = await adminService.changeUserPlan(req.params.id, req.body.plan);
    res.json(sub);
  } catch (error) {
    next(error);
  }
};

const getSubscriptionBreakdown = async (req, res, next) => {
  try {
    const breakdown = await adminService.getSubscriptionBreakdown();
    res.json(breakdown);
  } catch (error) {
    next(error);
  }
};

const getScraperStatus = async (req, res, next) => {
  try {
    const status = await adminService.getScraperStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
};

module.exports = { getKpis, getUsers, toggleUserStatus, changeUserPlan, getSubscriptionBreakdown, getScraperStatus };
