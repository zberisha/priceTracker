const subscriptionService = require('../services/subscription.service');

const getSubscription = async (req, res, next) => {
  try {
    const sub = await subscriptionService.getSubscription(req.user._id);
    res.json(sub);
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const sub = await subscriptionService.updateSubscription(req.user._id, req.body.plan);
    res.json(sub);
  } catch (error) {
    next(error);
  }
};

const getPlans = async (_req, res, next) => {
  try {
    const plans = subscriptionService.getPlans();
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubscription, updateSubscription, getPlans };
