import mongoose from 'mongoose';

const playtimeEntrySchema = new mongoose.Schema(
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

    // ── Submitted times (hours, decimal) ──────────────────────────────────
    mainStory:     { type: Number, default: null, min: 0.1, max: 9999 },
    sideContent:   { type: Number, default: null, min: 0.1, max: 9999 },
    completionist: { type: Number, default: null, min: 0.1, max: 9999 },

    platform: { type: String, default: null },

    // ── Submission quality ─────────────────────────────────────────────────
    isVerified:  { type: Boolean, default: false },
    isFlagged:   { type: Boolean, default: false },
    flagReason:  { type: String,  default: null },

    // ── Device/source metadata ─────────────────────────────────────────────
    source: {
      type:    String,
      enum:    ['manual', 'steam_import', 'api'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── One submission per user per game ───────────────────────────────────────
playtimeEntrySchema.index({ userId: 1, gameId: 1 }, { unique: true });
playtimeEntrySchema.index({ gameId: 1, isVerified: 1 });
playtimeEntrySchema.index({ createdAt: -1 });

// ── Statics ────────────────────────────────────────────────────────────────
playtimeEntrySchema.statics.getAggregatedStats = async function (gameId) {
  const pipeline = [
    {
      $match: {
        gameId:    new mongoose.Types.ObjectId(gameId),
        isFlagged: false,
      },
    },
    {
      $group: {
        _id: null,
        // ── Main Story ───────────────────────────────────────────────────
        msValues: {
          $push: {
            $cond: [{ $ne: ['$mainStory', null] }, '$mainStory', '$$REMOVE'],
          },
        },
        msSum:   { $sum: { $ifNull: ['$mainStory', 0] } },
        msCount: {
          $sum: { $cond: [{ $ne: ['$mainStory', null] }, 1, 0] },
        },
        // ── Side Content ─────────────────────────────────────────────────
        scValues: {
          $push: {
            $cond: [{ $ne: ['$sideContent', null] }, '$sideContent', '$$REMOVE'],
          },
        },
        scSum:   { $sum: { $ifNull: ['$sideContent', 0] } },
        scCount: {
          $sum: { $cond: [{ $ne: ['$sideContent', null] }, 1, 0] },
        },
        // ── Completionist ────────────────────────────────────────────────
        cpValues: {
          $push: {
            $cond: [{ $ne: ['$completionist', null] }, '$completionist', '$$REMOVE'],
          },
        },
        cpSum:   { $sum: { $ifNull: ['$completionist', 0] } },
        cpCount: {
          $sum: { $cond: [{ $ne: ['$completionist', null] }, 1, 0] },
        },
      },
    },
  ];

  const [raw] = await this.aggregate(pipeline);
  if (!raw) return emptyStats();

  return {
    mainStory:     buildStatBlock(raw.msValues, raw.msSum, raw.msCount),
    sideContent:   buildStatBlock(raw.scValues, raw.scSum, raw.scCount),
    completionist: buildStatBlock(raw.cpValues, raw.cpSum, raw.cpCount),
  };
};

// ── Helpers ────────────────────────────────────────────────────────────────
const buildStatBlock = (values, sum, count) => {
  if (!count) return { mean: null, median: null, min: null, max: null, count: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  return {
    mean:   Math.round((sum / count) * 10) / 10,
    median: Math.round(median * 10) / 10,
    min:    Math.round(sorted[0] * 10) / 10,
    max:    Math.round(sorted[sorted.length - 1] * 10) / 10,
    count,
  };
};

const emptyStats = () => ({
  mainStory:     { mean: null, median: null, min: null, max: null, count: 0 },
  sideContent:   { mean: null, median: null, min: null, max: null, count: 0 },
  completionist: { mean: null, median: null, min: null, max: null, count: 0 },
});

const PlaytimeEntry = mongoose.model('PlaytimeEntry', playtimeEntrySchema);
export default PlaytimeEntry;