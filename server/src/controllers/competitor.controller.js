const competitorService = require('../services/competitor.service');

const createCompetitor = async (req, res, next) => {
  try {
    const competitor = await competitorService.createCompetitor(req.user._id, req.body);
    res.status(201).json(competitor);
  } catch (error) {
    next(error);
  }
};

const getCompetitors = async (req, res, next) => {
  try {
    const competitors = await competitorService.getCompetitors(req.user._id, req.query.product);
    res.json(competitors);
  } catch (error) {
    next(error);
  }
};

const getCompetitorById = async (req, res, next) => {
  try {
    const competitor = await competitorService.getCompetitorById(req.user._id, req.params.id);
    res.json(competitor);
  } catch (error) {
    next(error);
  }
};

const updateCompetitor = async (req, res, next) => {
  try {
    const competitor = await competitorService.updateCompetitor(req.user._id, req.params.id, req.body);
    res.json(competitor);
  } catch (error) {
    next(error);
  }
};

const deleteCompetitor = async (req, res, next) => {
  try {
    await competitorService.deleteCompetitor(req.user._id, req.params.id);
    res.json({ message: 'Competitor removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCompetitor, getCompetitors, getCompetitorById, updateCompetitor, deleteCompetitor };
