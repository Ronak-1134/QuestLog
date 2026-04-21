import mongoose from 'mongoose';

// ── Sub-schemas ────────────────────────────────────────────────────────────
const playtimeStatsSchema = new mongoose.Schema(
  {
    mean:   { type: Number, default: null },
    median: { type: Number, default: null },
    min:    { type: Number, default: null },
    max:    { type: Number, default: null },
    count:  { type: Number, default: 0 },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    igdbId: {
      type:     Number,
      required: true,
      unique:   true,
      index:    true,
    },
    slug: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
      lowercase:true,
    },
    name:       { type: String, required: true, trim: true },
    summary:    { type: String, default: '' },
    cover:      { type: String, default: null },
    coverThumb: { type: String, default: null },
    screenshots:{ type: [String], default: [] },
    artworks:   { type: [String], default: [] },

    releaseYear: { type: Number, default: null, index: true },
    genres:      { type: [String], default: [], index: true },
    platforms:   { type: [String], default: [], index: true },
    developers:  { type: [String], default: [] },
    gameModes:   { type: [String], default: [] },
    themes:      { type: [String], default: [] },

    rating:      { type: Number, default: null },
    ratingCount: { type: Number, default: 0 },

    // ── Aggregated playtime stats (updated on each submission) ─────────────
    playtimeStats: {
      mainStory:     { type: playtimeStatsSchema, default: () => ({}) },
      sideContent:   { type: playtimeStatsSchema, default: () => ({}) },
      completionist: { type: playtimeStatsSchema, default: () => ({}) },
    },

    submissionCount: { type: Number, default: 0, index: true },
    viewCount:       { type: Number, default: 0 },

    // ── AI prediction cache ────────────────────────────────────────────────
    aiPrediction: {
      mainStory:     { type: Number, default: null },
      sideContent:   { type: Number, default: null },
      completionist: { type: Number, default: null },
      generatedAt:   { type: Date,   default: null },
    },

    lastIgdbSync: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtuals ───────────────────────────────────────────────────────────────
gameSchema.virtual('hasPlaytimeData').get(function () {
  return this.playtimeStats.mainStory.count > 0;
});

gameSchema.virtual('igdbUrl').get(function () {
  return `https://www.igdb.com/games/${this.slug}`;
});

// ── Indexes ────────────────────────────────────────────────────────────────
gameSchema.index({ name: 'text', summary: 'text' });
gameSchema.index({ submissionCount: -1 });
gameSchema.index({ releaseYear: -1, rating: -1 });

// ── Statics ────────────────────────────────────────────────────────────────
gameSchema.statics.findByIgdbId = function (igdbId) {
  return this.findOne({ igdbId: Number(igdbId) });
};

gameSchema.statics.findOrCreateFromIgdb = async function (igdbData) {
  const existing = await this.findOne({ igdbId: igdbData.igdbId });
  if (existing) return existing;

  return this.create({
    ...igdbData,
    lastIgdbSync: new Date(),
  });
};

gameSchema.statics.getTopGames = function (limit = 20) {
  return this.find({ submissionCount: { $gt: 0 } })
    .sort({ submissionCount: -1 })
    .limit(limit)
    .select('igdbId name slug cover releaseYear genres playtimeStats submissionCount');
};

// ── Methods ────────────────────────────────────────────────────────────────
gameSchema.methods.incrementViews = function () {
  return this.constructor.updateOne(
    { _id: this._id },
    { $inc: { viewCount: 1 } }
  );
};

const Game = mongoose.model('Game', gameSchema);
export default Game;