import { Router }  from 'express';
import mongoose    from 'mongoose';

const router = Router();

// ── Mission Progress Schema ────────────────────────────────────────
let MissionProgress;
try {
  MissionProgress = mongoose.model('MissionProgress');
} catch {
  MissionProgress = mongoose.model('MissionProgress',
    new mongoose.Schema({
      userId:      { type: String, required: true },
      gameSlug:    { type: String, required: true },
      missionId:   { type: String, required: true },
      completed:   { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    }, { timestamps: true })
  );
  // Compound index for fast lookups
  MissionProgress.schema.index({ userId: 1, gameSlug: 1 });
  MissionProgress.schema.index({ userId: 1, gameSlug: 1, missionId: 1 }, { unique: true });
}

// ── Inline mission data (no external import needed) ────────────────
const MISSIONS = {
  'elden-ring': {
    chapters: [
      {
        title: 'Limgrave',
        missions: [
          { id: 'er_001', title: 'Margit, the Fell Omen',             type: 'main' },
          { id: 'er_002', title: 'Godrick the Grafted',               type: 'main' },
          { id: 'er_s01', title: 'White-Faced Varre questline',       type: 'side' },
          { id: 'er_s02', title: 'Roderika questline',                type: 'side' },
          { id: 'er_s03', title: 'Patches questline',                 type: 'side' },
          { id: 'er_s04', title: 'Bloody Finger Hunter Yura',         type: 'side' },
        ],
      },
      {
        title: 'Liurnia of the Lakes',
        missions: [
          { id: 'er_003', title: 'Red Wolf of Radagon',               type: 'main' },
          { id: 'er_004', title: 'Rennala, Queen of the Full Moon',   type: 'main' },
          { id: 'er_s05', title: 'Ranni the Witch questline',         type: 'side' },
          { id: 'er_s06', title: 'Sorcerer Rogier questline',         type: 'side' },
          { id: 'er_s07', title: 'Fia, the Deathbed Companion',       type: 'side' },
          { id: 'er_s08', title: 'Nepheli Loux questline',            type: 'side' },
        ],
      },
      {
        title: 'Caelid',
        missions: [
          { id: 'er_005', title: 'Starscourge Radahn',                type: 'main' },
          { id: 'er_s09', title: 'Millicent questline',               type: 'side' },
          { id: 'er_s10', title: 'D, Hunter of the Dead',             type: 'side' },
        ],
      },
      {
        title: 'Altus Plateau & Mt. Gelmir',
        missions: [
          { id: 'er_006', title: 'Godfrey (Golden Shade)',            type: 'main' },
          { id: 'er_007', title: 'Morgott, the Omen King',            type: 'main' },
          { id: 'er_s11', title: 'Volcano Manor questline',           type: 'side' },
          { id: 'er_s12', title: 'Dung Eater questline',              type: 'side' },
        ],
      },
      {
        title: 'Mountaintops of the Giants',
        missions: [
          { id: 'er_008', title: 'Fire Giant',                        type: 'main' },
          { id: 'er_009', title: 'Burn the Erdtree',                  type: 'main' },
          { id: 'er_s13', title: 'Goldmask questline',                type: 'side' },
        ],
      },
      {
        title: 'Crumbling Farum Azula',
        missions: [
          { id: 'er_010', title: 'Maliketh, the Black Blade',         type: 'main' },
          { id: 'er_011', title: 'Godfrey / Hoarah Loux',             type: 'main' },
        ],
      },
      {
        title: 'Leyndell, Ashen Capital',
        missions: [
          { id: 'er_012', title: 'Radagon of the Golden Order',       type: 'main' },
          { id: 'er_013', title: 'Elden Beast',                       type: 'main' },
        ],
      },
    ],
  },

  'grand-theft-auto-v': {
    chapters: [
      {
        title: 'Prologue',
        missions: [
          { id: 'gta_001', title: 'Prologue',                         type: 'main' },
        ],
      },
      {
        title: 'Chapter 1',
        missions: [
          { id: 'gta_002', title: 'Franklin and Lamar',               type: 'main' },
          { id: 'gta_003', title: 'Repossession',                     type: 'main' },
          { id: 'gta_004', title: 'Complications',                    type: 'main' },
          { id: 'gta_005', title: 'Father/Son',                       type: 'main' },
          { id: 'gta_006', title: 'Marriage Counseling',              type: 'main' },
          { id: 'gta_007', title: "Daddy's Little Girl",              type: 'main' },
          { id: 'gta_008', title: 'Friend Request',                   type: 'main' },
          { id: 'gta_009', title: 'Casing the Jewel Store',           type: 'main' },
          { id: 'gta_010', title: 'The Jewel Store Job',              type: 'main' },
        ],
      },
      {
        title: 'Chapter 2 — Blaine County',
        missions: [
          { id: 'gta_011', title: 'Mr. Phillips',                     type: 'main' },
          { id: 'gta_012', title: 'Nervous Ron',                      type: 'main' },
          { id: 'gta_013', title: 'Crystal Maze',                     type: 'main' },
          { id: 'gta_014', title: 'Friends Reunited',                 type: 'main' },
          { id: 'gta_015', title: 'Fame or Shame',                    type: 'main' },
          { id: 'gta_016', title: 'Dead Man Walking',                 type: 'main' },
          { id: 'gta_017', title: "Three's Company",                  type: 'main' },
          { id: 'gta_018', title: 'By the Book',                      type: 'main' },
          { id: 'gta_019', title: 'Hood Safari',                      type: 'main' },
        ],
      },
      {
        title: 'Chapter 3 — The Big Score Prep',
        missions: [
          { id: 'gta_020', title: 'Scouting the Port',                type: 'main' },
          { id: 'gta_021', title: 'Merryweather Heist',               type: 'main' },
          { id: 'gta_022', title: 'Blitz Play',                       type: 'main' },
          { id: 'gta_023', title: 'Caida Libre',                      type: 'main' },
          { id: 'gta_024', title: 'Deep Inside',                      type: 'main' },
          { id: 'gta_025', title: 'Minor Turbulence',                 type: 'main' },
          { id: 'gta_026', title: 'Paleto Score Setup',               type: 'main' },
          { id: 'gta_027', title: 'The Paleto Score',                 type: 'main' },
          { id: 'gta_028', title: 'Monkey Business',                  type: 'main' },
          { id: 'gta_029', title: 'Surveying the Score',              type: 'main' },
          { id: 'gta_030', title: 'Bury the Hatchet',                 type: 'main' },
          { id: 'gta_031', title: 'Fresh Meat',                       type: 'main' },
          { id: 'gta_032', title: 'The Wrap Up',                      type: 'main' },
          { id: 'gta_033', title: 'Lamar Down',                       type: 'main' },
          { id: 'gta_034', title: 'Meltdown',                         type: 'main' },
          { id: 'gta_035', title: 'The Big Score',                    type: 'main' },
        ],
      },
      {
        title: 'Endings',
        missions: [
          { id: 'gta_036', title: 'Something Sensible (Ending A)',    type: 'main' },
          { id: 'gta_037', title: "The Time's Come (Ending B)",       type: 'main' },
          { id: 'gta_038', title: 'The Third Way (Ending C)',         type: 'main' },
        ],
      },
      {
        title: 'Side Missions',
        missions: [
          { id: 'gta_s01', title: 'Chop',                             type: 'side' },
          { id: 'gta_s02', title: 'Strangers — Tonya Tow Truck 1',   type: 'side' },
          { id: 'gta_s03', title: 'Strangers — Tonya Tow Truck 2',   type: 'side' },
          { id: 'gta_s04', title: 'Strangers — Beverly Photographer',type: 'side' },
          { id: 'gta_s05', title: 'Strangers — Mary-Ann Running',    type: 'side' },
          { id: 'gta_s06', title: 'Strangers — Hao Street Race',     type: 'side' },
          { id: 'gta_s07', title: 'Rampage 1',                       type: 'side' },
          { id: 'gta_s08', title: 'Rampage 2',                       type: 'side' },
          { id: 'gta_s09', title: 'Rampage 3',                       type: 'side' },
          { id: 'gta_s10', title: 'Rampage 4',                       type: 'side' },
          { id: 'gta_s11', title: 'Rampage 5',                       type: 'side' },
          { id: 'gta_s12', title: 'Epsilon Program',                 type: 'side' },
        ],
      },
    ],
  },

  'red-dead-redemption-2': {
    chapters: [
      {
        title: 'Prologue',
        missions: [
          { id: 'rdr_001', title: 'Outlaws from the West',           type: 'main' },
          { id: 'rdr_002', title: 'Enter, Pursued by a Memory',      type: 'main' },
          { id: 'rdr_003', title: 'The Aftermath of Genesis',        type: 'main' },
          { id: 'rdr_004', title: 'Old Friends',                     type: 'main' },
        ],
      },
      {
        title: 'Chapter 1 — Horseshoe Overlook',
        missions: [
          { id: 'rdr_005', title: 'The Spines of America',           type: 'main' },
          { id: 'rdr_006', title: "Blessed are the Meek?",           type: 'main' },
          { id: 'rdr_007', title: 'Polite Society, Valentine Style', type: 'main' },
          { id: 'rdr_008', title: 'Americans at Rest',               type: 'main' },
          { id: 'rdr_009', title: 'Exit Pursued by a Bruised Ego',  type: 'main' },
        ],
      },
      {
        title: 'Chapter 2 — Clemens Point',
        missions: [
          { id: 'rdr_010', title: 'The Sheep and the Goats',        type: 'main' },
          { id: 'rdr_011', title: 'An American Pastoral Scene',     type: 'main' },
          { id: 'rdr_012', title: 'Pouring Forth Oil',              type: 'main' },
          { id: 'rdr_013', title: "Sodom? Back to Gomorrah",        type: 'main' },
        ],
      },
      {
        title: 'Chapter 3',
        missions: [
          { id: 'rdr_014', title: 'The New South',                  type: 'main' },
          { id: 'rdr_015', title: 'Blood Feuds, Ancient and Modern',type: 'main' },
          { id: 'rdr_016', title: 'The Course of True Love',        type: 'main' },
        ],
      },
      {
        title: 'Chapter 4 — Shady Belle',
        missions: [
          { id: 'rdr_017', title: 'The Gilded Cage',                type: 'main' },
          { id: 'rdr_018', title: 'A Fine Night of Debauchery',     type: 'main' },
          { id: 'rdr_019', title: 'Urban Pleasures',                type: 'main' },
          { id: 'rdr_020', title: 'Banking, the Old American Art',  type: 'main' },
        ],
      },
      {
        title: 'Chapter 5 — Guarma',
        missions: [
          { id: 'rdr_021', title: 'Welcome to the New World',       type: 'main' },
          { id: 'rdr_022', title: 'Dear Uncle Tacitus',             type: 'main' },
          { id: 'rdr_023', title: 'Hell Hath No Fury',              type: 'main' },
          { id: 'rdr_024', title: 'Paradise Mercifully Departed',   type: 'main' },
        ],
      },
      {
        title: 'Chapter 6 — Beaver Hollow',
        missions: [
          { id: 'rdr_025', title: 'Visiting Hours',                 type: 'main' },
          { id: 'rdr_026', title: 'The Bridge to Nowhere',          type: 'main' },
          { id: 'rdr_027', title: 'My Last Boy',                    type: 'main' },
          { id: 'rdr_028', title: 'Our Best Selves',                type: 'main' },
          { id: 'rdr_029', title: 'Red Dead Redemption',            type: 'main' },
        ],
      },
      {
        title: 'Epilogue',
        missions: [
          { id: 'rdr_030', title: 'The Wheel',                      type: 'main' },
          { id: 'rdr_031', title: 'Farming, for Beginners',         type: 'main' },
          { id: 'rdr_032', title: 'American Venom',                 type: 'main' },
        ],
      },
    ],
  },

  'cyberpunk-2077': {
    chapters: [
      {
        title: 'Act 1',
        missions: [
          { id: 'cp_001', title: 'The Nomad / Corpo / Street Kid',  type: 'main' },
          { id: 'cp_002', title: 'The Rescue',                      type: 'main' },
          { id: 'cp_003', title: 'The Ride',                        type: 'main' },
          { id: 'cp_004', title: 'The Heist',                       type: 'main' },
        ],
      },
      {
        title: 'Act 2',
        missions: [
          { id: 'cp_005', title: 'Playing for Time',                type: 'main' },
          { id: 'cp_006', title: 'Transmission',                    type: 'main' },
          { id: 'cp_007', title: 'Life During Wartime',             type: 'main' },
          { id: 'cp_008', title: 'Down on the Street',              type: 'main' },
          { id: 'cp_009', title: 'Gimme Danger',                    type: 'main' },
          { id: 'cp_010', title: 'Play It Safe',                    type: 'main' },
          { id: 'cp_011', title: 'Search and Destroy',              type: 'main' },
          { id: 'cp_012', title: 'Ghost Town',                      type: 'main' },
          { id: 'cp_013', title: 'Lightning Breaks',                type: 'main' },
          { id: 'cp_014', title: 'I Walk the Line',                 type: 'main' },
          { id: 'cp_015', title: 'Riders on the Storm',             type: 'main' },
          { id: 'cp_s01', title: 'Judy — Automatic Love',           type: 'side' },
          { id: 'cp_s02', title: 'Judy — Ex-Factor',                type: 'side' },
          { id: 'cp_s03', title: 'Panam — Riders on the Storm',     type: 'side' },
          { id: 'cp_s04', title: 'River Ward questline',            type: 'side' },
          { id: 'cp_s05', title: 'Kerry Eurodyne questline',        type: 'side' },
        ],
      },
      {
        title: 'Act 3 — Endings',
        missions: [
          { id: 'cp_016', title: 'Nocturne Op55N1',                 type: 'main' },
          { id: 'cp_017', title: 'Ending — The Star',               type: 'main' },
          { id: 'cp_018', title: 'Ending — The Devil',              type: 'main' },
          { id: 'cp_019', title: 'Ending — The Sun',                type: 'main' },
          { id: 'cp_020', title: 'Ending — Temperance',             type: 'main' },
        ],
      },
    ],
  },

  'god-of-war': {
    chapters: [
      {
        title: 'The Journey',
        missions: [
          { id: 'gow_001', title: 'The Marked Trees',               type: 'main' },
          { id: 'gow_002', title: 'Path to the Mountain',           type: 'main' },
          { id: 'gow_003', title: 'A Realm Beyond',                 type: 'main' },
          { id: 'gow_004', title: 'The Light of Alfheim',           type: 'main' },
          { id: 'gow_005', title: 'Inside the Mountain',            type: 'main' },
          { id: 'gow_006', title: 'Between the Realms',             type: 'main' },
          { id: 'gow_007', title: 'Escape from Helheim',            type: 'main' },
          { id: 'gow_008', title: 'The Summit',                     type: 'main' },
          { id: 'gow_009', title: 'Return to the Summit',           type: 'main' },
          { id: 'gow_010', title: 'Behind the Lock',                type: 'main' },
          { id: 'gow_011', title: "Mother's Ashes",                 type: 'main' },
        ],
      },
      {
        title: 'Favors',
        missions: [
          { id: 'gow_s01', title: 'Second Hand Soul',               type: 'side' },
          { id: 'gow_s02', title: "Fafnir's Hoard",                type: 'side' },
          { id: 'gow_s03', title: 'Valkyrie — Eir',                type: 'side' },
          { id: 'gow_s04', title: 'Valkyrie — Gondul',             type: 'side' },
          { id: 'gow_s05', title: 'Valkyrie — Geirdriful',         type: 'side' },
          { id: 'gow_s06', title: 'Valkyrie Queen — Sigrun',       type: 'side' },
        ],
      },
    ],
  },

  'the-witcher-3-wild-hunt': {
    chapters: [
      {
        title: 'White Orchard',
        missions: [
          { id: 'w3_001', title: 'Lilac and Gooseberries',          type: 'main' },
          { id: 'w3_002', title: 'The Beast of White Orchard',      type: 'main' },
        ],
      },
      {
        title: "Velen — No Man's Land",
        missions: [
          { id: 'w3_003', title: 'Bloody Baron',                    type: 'main' },
          { id: 'w3_004', title: 'Ladies of the Wood',              type: 'main' },
          { id: 'w3_005', title: 'Wandering in the Dark',           type: 'main' },
          { id: 'w3_s01', title: 'A Dangerous Game',                type: 'side' },
          { id: 'w3_s02', title: 'An Eye For An Eye',               type: 'side' },
        ],
      },
      {
        title: 'Novigrad',
        missions: [
          { id: 'w3_006', title: 'Pyres of Novigrad',               type: 'main' },
          { id: 'w3_007', title: 'Get Junior',                      type: 'main' },
          { id: 'w3_008', title: 'Broken Flowers',                  type: 'main' },
          { id: 'w3_009', title: "Count Reuven's Treasure",         type: 'main' },
          { id: 'w3_s03', title: 'Now or Never',                    type: 'side' },
        ],
      },
      {
        title: 'Skellige',
        missions: [
          { id: 'w3_010', title: 'Destination: Skellige',           type: 'main' },
          { id: 'w3_011', title: 'The King is Dead',                type: 'main' },
          { id: 'w3_012', title: 'Possession',                      type: 'main' },
          { id: 'w3_013', title: 'The Lord of Undvik',              type: 'main' },
          { id: 'w3_s04', title: "King's Gambit",                   type: 'side' },
        ],
      },
      {
        title: 'Final Act',
        missions: [
          { id: 'w3_014', title: 'The Isle of Mists',               type: 'main' },
          { id: 'w3_015', title: 'The Battle of Kaer Morhen',       type: 'main' },
          { id: 'w3_016', title: 'Blood on the Battlefield',        type: 'main' },
          { id: 'w3_017', title: 'Final Preparations',              type: 'main' },
          { id: 'w3_018', title: 'Bald Mountain',                   type: 'main' },
          { id: 'w3_019', title: 'Something Ends, Something Begins',type: 'main' },
        ],
      },
    ],
  },
};

// ── GET /api/missions/:slug ────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const { slug }   = req.params;
    const { userId } = req.query;
    const data       = MISSIONS[slug];

    if (!data) {
      return res.json({
        status: 'success',
        data:   { slug, hasData: false, chapters: [],
                  totalMissions: 0, completedMissions: 0,
                  completionPercent: 0 },
      });
    }

    // Get user progress
    let completedIds = new Set();
    if (userId) {
      const progress = await MissionProgress.find({
        userId, gameSlug: slug, completed: true,
      }).lean();
      completedIds = new Set(progress.map((p) => p.missionId));
    }

    const chapters = data.chapters.map((ch) => {
      const missions = ch.missions.map((m) => ({
        ...m,
        completed: completedIds.has(m.id),
      }));
      return {
        ...ch,
        missions,
        completedCount: missions.filter((m) => m.completed).length,
        totalCount:     missions.length,
      };
    });

    const totalMissions     = chapters.reduce((s, c) => s + c.totalCount, 0);
    const completedMissions = chapters.reduce((s, c) => s + c.completedCount, 0);

    res.json({
      status: 'success',
      data: {
        slug, hasData: true, chapters,
        totalMissions, completedMissions,
        completionPercent: totalMissions
          ? Math.round((completedMissions / totalMissions) * 100)
          : 0,
      },
    });
  } catch (err) {
    console.error('Missions GET error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── POST /api/missions/:slug/toggle ───────────────────────────────
router.post('/:slug/toggle', async (req, res) => {
  try {
    const { slug }                       = req.params;
    const { userId, missionId, completed } = req.body;

    if (!userId || !missionId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and missionId are required',
      });
    }

    await MissionProgress.findOneAndUpdate(
      { userId, gameSlug: slug, missionId },
      { completed, completedAt: completed ? new Date() : null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ status: 'success', data: { missionId, completed } });
  } catch (err) {
    console.error('Missions toggle error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── POST /api/missions/:slug/bulk ─────────────────────────────────
router.post('/:slug/bulk', async (req, res) => {
  try {
    const { slug }                         = req.params;
    const { userId, missionIds, completed } = req.body;

    if (!userId || !Array.isArray(missionIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and missionIds[] are required',
      });
    }

    await Promise.all(
      missionIds.map((missionId) =>
        MissionProgress.findOneAndUpdate(
          { userId, gameSlug: slug, missionId },
          { completed, completedAt: completed ? new Date() : null },
          { upsert: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.json({
      status: 'success',
      data:   { updated: missionIds.length },
    });
  } catch (err) {
    console.error('Missions bulk error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;