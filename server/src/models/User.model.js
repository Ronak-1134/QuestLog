import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    username: {
      type:      String,
      unique:    true,
      sparse:    true,
      trim:      true,
      minlength: 3,
      maxlength: 24,
      match:     [/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, underscores'],
    },
    avatar:   { type: String, default: null },
    bio:      { type: String, maxlength: 160, default: '' },

    steam: {
      steamId:   { type: String, default: null },
      profileUrl:{ type: String, default: null },
      lastSync:  { type: Date,   default: null },
      gameCount: { type: Number, default: 0 },
    },

    preferences: {
      defaultPlatform: { type: String, default: null },
      publicProfile:   { type: Boolean, default: true },
      showBacklog:     { type: Boolean, default: true },
    },

    stats: {
      totalGames:     { type: Number, default: 0 },
      completedGames: { type: Number, default: 0 },
      totalHours:     { type: Number, default: 0 },
      avgCompletion:  { type: Number, default: 0 },
    },

    role: {
      type:    String,
      enum:    ['user', 'moderator', 'admin'],
      default: 'user',
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtuals ───────────────────────────────────────────────────────────────
userSchema.virtual('completionRate').get(function () {
  if (!this.stats.totalGames) return 0;
  return Math.round((this.stats.completedGames / this.stats.totalGames) * 100);
});

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ 'steam.steamId': 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

// ── Statics ────────────────────────────────────────────────────────────────
userSchema.statics.findByUid = function (uid) {
  return this.findOne({ uid });
};

userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

// ── Recalculate denormalized stats ─────────────────────────────────────────
userSchema.methods.recalcStats = async function () {
  const UserGame = mongoose.model('UserGame');

  const [agg] = await UserGame.aggregate([
    { $match: { userId: this._id } },
    {
      $group: {
        _id:            null,
        totalGames:     { $sum: 1 },
        completedGames: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        totalHours: { $sum: '$playtimeHours' },
      },
    },
  ]);

  if (agg) {
    this.stats.totalGames     = agg.totalGames;
    this.stats.completedGames = agg.completedGames;
    this.stats.totalHours     = Math.round(agg.totalHours * 10) / 10;
    this.stats.avgCompletion  =
      agg.totalGames ? Math.round((agg.completedGames / agg.totalGames) * 100) : 0;
    await this.save();
  }

  return this;
};

const User = mongoose.model('User', userSchema);
export default User;