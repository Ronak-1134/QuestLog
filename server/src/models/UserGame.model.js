import mongoose from 'mongoose';

const STATUS = ['playing', 'completed', 'backlog', 'dropped', 'wishlist', 'replaying'];
const PLATFORM_CHOICES = [
  'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S',
  'Xbox One', 'Nintendo Switch', 'iOS', 'Android', 'Other',
];

const userGameSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    gameId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Game',
      required: true,
      index:    true,
    },
    igdbId: { type: Number, required: true, index: true },

    status: {
      type:    String,
      enum:    STATUS,
      default: 'backlog',
      index:   true,
    },
    platform: {
      type: String,
      enum: [...PLATFORM_CHOICES, null],
      default: null,
    },

    // ── Personal playtime ──────────────────────────────────────────────────
    playtimeHours: { type: Number, default: 0, min: 0 },

    // ── User's own completion times (may differ from submitted stats) ──────
    personalTimes: {
      mainStory:     { type: Number, default: null, min: 0 },
      sideContent:   { type: Number, default: null, min: 0 },
      completionist: { type: Number, default: null, min: 0 },
    },

    // ── Progress ───────────────────────────────────────────────────────────
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    rating:          { type: Number, default: null, min: 1, max: 10 },
    review:          { type: String, default: '', maxlength: 1000 },

    // ── Dates ──────────────────────────────────────────────────────────────
    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // ── Flags ──────────────────────────────────────────────────────────────
    isFavorite:   { type: Boolean, default: false },
    fromSteam:    { type: Boolean, default: false },
    isHidden:     { type: Boolean, default: false },

    notes: { type: String, default: '', maxlength: 500 },

    // ── Steam metadata (populated during sync) ────────────────────────────
    steam: {
      appId:             { type: Number, default: null },
      playtimeForever:   { type: Number, default: 0 },  // minutes from Steam
      lastPlayedSteam:   { type: Date,   default: null },
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Compound unique: one entry per user per game ───────────────────────────
userGameSchema.index({ userId: 1, gameId: 1 }, { unique: true });
userGameSchema.index({ userId: 1, status: 1 });
userGameSchema.index({ userId: 1, isFavorite: 1 });
userGameSchema.index({ userId: 1, updatedAt: -1 });

// ── Virtuals ───────────────────────────────────────────────────────────────
userGameSchema.virtual('steamHours').get(function () {
  if (!this.steam?.playtimeForever) return 0;
  return Math.round((this.steam.playtimeForever / 60) * 10) / 10;
});

userGameSchema.virtual('isUnplayed').get(function () {
  return this.status === 'backlog' && this.playtimeHours === 0;
});

// ── Statics ────────────────────────────────────────────────────────────────
userGameSchema.statics.getBacklog = function (userId) {
  return this.find({ userId, status: 'backlog' })
    .populate('gameId', 'name slug cover releaseYear genres playtimeStats')
    .sort({ updatedAt: -1 });
};

userGameSchema.statics.getLibrary = function (userId, filters = {}) {
  const query = { userId, isHidden: false, ...filters };
  return this.find(query)
    .populate('gameId', 'name slug cover releaseYear genres playtimeStats rating')
    .sort({ updatedAt: -1 });
};

userGameSchema.statics.getPileOfShame = function (userId) {
  return this.find({
    userId,
    status:        { $in: ['backlog', 'dropped'] },
    playtimeHours: 0,
  }).populate('gameId', 'name slug cover releaseYear');
};

userGameSchema.statics.getStatusCounts = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return STATUS.reduce((acc, s) => {
    acc[s] = result.find((r) => r._id === s)?.count ?? 0;
    return acc;
  }, {});
};

const UserGame = mongoose.model('UserGame', userGameSchema);
export default UserGame;