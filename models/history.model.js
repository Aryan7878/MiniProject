const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true,
        trim: true
    },
    resultsCount: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for performance and to allow auto-deletion of old history if needed
searchHistorySchema.index({ user: 1, timestamp: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;
