const SearchHistory = require('../models/history.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.addHistory = catchAsync(async (req, res, next) => {
    const { query, resultsCount } = req.body;

    const history = await SearchHistory.create({
        user: req.user.id,
        query,
        resultsCount
    });

    res.status(201).json({
        status: 'success',
        data: history
    });
});

exports.getMyHistory = catchAsync(async (req, res, next) => {
    const history = await SearchHistory.find({ user: req.user.id })
        .sort('-timestamp')
        .limit(20);

    res.status(200).json({
        status: 'success',
        results: history.length,
        data: history
    });
});

exports.clearHistory = catchAsync(async (req, res, next) => {
    await SearchHistory.deleteMany({ user: req.user.id });

    res.status(204).json({
        status: 'success',
        data: null
    });
});
