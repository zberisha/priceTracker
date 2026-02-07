const trackingService = require('../services/tracking.service');

const createTracking = async (req, res, next) => {
  try {
    const tracking = await trackingService.createTracking(req.user._id, req.body);
    res.status(201).json(tracking);
  } catch (error) {
    next(error);
  }
};

const getTrackings = async (req, res, next) => {
  try {
    const trackings = await trackingService.getTrackings(req.user._id);
    res.json(trackings);
  } catch (error) {
    next(error);
  }
};

const updateTracking = async (req, res, next) => {
  try {
    const tracking = await trackingService.updateTracking(req.user._id, req.params.id, req.body);
    res.json(tracking);
  } catch (error) {
    next(error);
  }
};

const deleteTracking = async (req, res, next) => {
  try {
    await trackingService.deleteTracking(req.user._id, req.params.id);
    res.json({ message: 'Tracking removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTracking, getTrackings, updateTracking, deleteTracking };
