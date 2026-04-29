// Pre-loaded missions for popular games
// Key = IGDB slug
export const GAME_MISSIONS = {
  'grand-theft-auto-v': {
    chapters: [
      {
        title: 'Prologue',
        missions: [
          { id: 'gta5_001', title: 'Prologue', type: 'main' },
        ],
      },
      {
        title: 'Chapter 1 — Los Santos',
        missions: [
          { id: 'gta5_002', title: 'Franklin and Lamar',           type: 'main' },
          { id: 'gta5_003', title: 'Repossession',                  type: 'main' },
          { id: 'gta5_004', title: 'Complications',                 type: 'main' },
          { id: 'gta5_005', title: 'Father/Son',                    type: 'main' },
          { id: 'gta5_006', title: 'Marriage Counseling',           type: 'main' },
          { id: 'gta5_007', title: 'Daddy\'s Little Girl',          type: 'main' },
          { id: 'gta5_008', title: 'Friend Request',                type: 'main' },
          { id: 'gta5_009', title: 'Casing the Jewel Store',        type: 'main' },
          { id: 'gta5_010', title: 'Carbine Rifles',                type: 'main' },
          { id: 'gta5_011', title: 'The Jewel Store Job',           type: 'main' },
          { id: 'gta5_s01', title: 'Chop',                          type: 'side' },
          { id: 'gta5_s02', title: 'Trevor Philips Industries',     type: 'side' },
        ],
      },
      {
        title: 'Chapter 2 — Blaine County',
        missions: [
          { id: 'gta5_012', title: 'Mr. Phillips',                  type: 'main' },
          { id: 'gta5_013', title: 'Nervous Ron',                   type: 'main' },
          { id: 'gta5_014', title: 'Crystal Maze',                  type: 'main' },
          { id: 'gta5_015', title: 'Friends Reunited',              type: 'main' },
          { id: 'gta5_016', title: 'Fame or Shame',                 type: 'main' },
          { id: 'gta5_017', title: 'Dead Man Walking',              type: 'main' },
          { id: 'gta5_018', title: 'Three\'s Company',              type: 'main' },
          { id: 'gta5_019', title: 'By the Book',                   type: 'main' },
          { id: 'gta5_020', title: 'Hood Safari',                   type: 'main' },
          { id: 'gta5_s03', title: 'Blitz Play',                    type: 'side' },
          { id: 'gta5_s04', title: 'I Fought the Law',              type: 'side' },
        ],
      },
      {
        title: 'Chapter 3 — The Big Score Prep',
        missions: [
          { id: 'gta5_021', title: 'Scouting the Port',             type: 'main' },
          { id: 'gta5_022', title: 'Minisub',                       type: 'main' },
          { id: 'gta5_023', title: 'Merryweather Heist',            type: 'main' },
          { id: 'gta5_024', title: 'Blitz Play',                    type: 'main' },
          { id: 'gta5_025', title: 'Caida Libre',                   type: 'main' },
          { id: 'gta5_026', title: 'Deep Inside',                   type: 'main' },
          { id: 'gta5_027', title: 'Minor Turbulence',              type: 'main' },
          { id: 'gta5_028', title: 'Paleto Score Setup',            type: 'main' },
          { id: 'gta5_029', title: 'Predator',                      type: 'main' },
          { id: 'gta5_030', title: 'The Paleto Score',              type: 'main' },
          { id: 'gta5_031', title: 'Military Hardware',             type: 'main' },
          { id: 'gta5_032', title: 'Monkey Business',               type: 'main' },
          { id: 'gta5_033', title: 'Hang Ten',                      type: 'main' },
          { id: 'gta5_034', title: 'Surveying the Score',           type: 'main' },
          { id: 'gta5_035', title: 'Bury the Hatchet',              type: 'main' },
          { id: 'gta5_036', title: 'Pack Man',                      type: 'main' },
          { id: 'gta5_037', title: 'Fresh Meat',                    type: 'main' },
          { id: 'gta5_038', title: 'The Wrap Up',                   type: 'main' },
          { id: 'gta5_039', title: 'Lamar Down',                    type: 'main' },
          { id: 'gta5_040', title: 'Meltdown',                      type: 'main' },
          { id: 'gta5_041', title: 'Whatever It Takes',             type: 'main' },
          { id: 'gta5_042', title: 'The Big Score',                 type: 'main' },
        ],
      },
      {
        title: 'Ending',
        missions: [
          { id: 'gta5_043', title: 'Something Sensible (Ending A)', type: 'main' },
          { id: 'gta5_044', title: 'The Time\'s Come (Ending B)',   type: 'main' },
          { id: 'gta5_045', title: 'The Third Way (Ending C)',      type: 'main' },
        ],
      },
      {
        title: 'Side Missions',
        missions: [
          { id: 'gta5_s05', title: 'Strangers & Freaks — Tonya #1', type: 'side' },
          { id: 'gta5_s06', title: 'Strangers & Freaks — Tonya #2', type: 'side' },
          { id: 'gta5_s07', title: 'Strangers & Freaks — Beverly',  type: 'side' },
          { id: 'gta5_s08', title: 'Strangers & Freaks — Mary-Ann', type: 'side' },
          { id: 'gta5_s09', title: 'Strangers & Freaks — Hao',      type: 'side' },
          { id: 'gta5_s10', title: 'Rampage #1',                    type: 'side' },
          { id: 'gta5_s11', title: 'Rampage #2',                    type: 'side' },
          { id: 'gta5_s12', title: 'Rampage #3',                    type: 'side' },
          { id: 'gta5_s13', title: 'Rampage #4',                    type: 'side' },
          { id: 'gta5_s14', title: 'Rampage #5',                    type: 'side' },
          { id: 'gta5_s15', title: 'Epsilon Program',               type: 'side' },
          { id: 'gta5_s16', title: 'Grass Roots',                   type: 'side' },
          { id: 'gta5_s17', title: 'Abigail Mako',                  type: 'side' },
        ],
      },
    ],
  },

  'elden-ring': {
    chapters: [
      {
        title: 'Limgrave',
        missions: [
          { id: 'er_001', title: 'Margit, the Fell Omen',          type: 'main' },
          { id: 'er_002', title: 'Godrick the Grafted',             type: 'main' },
          { id: 'er_s01', title: 'White-Faced Varre questline',     type: 'side' },
          { id: 'er_s02', title: 'Roderika questline',              type: 'side' },
          { id: 'er_s03', title: 'Patches questline',               type: 'side' },
          { id: 'er_s04', title: 'Bloody Finger Hunter Yura',       type: 'side' },
        ],
      },
      {
        title: 'Liurnia of the Lakes',
        missions: [
          { id: 'er_003', title: 'Red Wolf of Radagon',             type: 'main' },
          { id: 'er_004', title: 'Rennala, Queen of the Full Moon', type: 'main' },
          { id: 'er_s05', title: 'Ranni the Witch questline',       type: 'side' },
          { id: 'er_s06', title: 'Sorcerer Rogier questline',       type: 'side' },
          { id: 'er_s07', title: 'Fia, the Deathbed Companion',     type: 'side' },
          { id: 'er_s08', title: 'Nepheli Loux questline',          type: 'side' },
        ],
      },
      {
        title: 'Caelid',
        missions: [
          { id: 'er_005', title: 'Starscourge Radahn',              type: 'main' },
          { id: 'er_s09', title: 'Millicent questline',             type: 'side' },
          { id: 'er_s10', title: 'D, Hunter of the Dead',           type: 'side' },
        ],
      },
      {
        title: 'Altus Plateau & Mt. Gelmir',
        missions: [
          { id: 'er_006', title: 'Godfrey, First Elden Lord (Golden)', type: 'main' },
          { id: 'er_007', title: 'Morgott, the Omen King',             type: 'main' },
          { id: 'er_s11', title: 'Volcano Manor questline',            type: 'side' },
          { id: 'er_s12', title: 'Dung Eater questline',               type: 'side' },
        ],
      },
      {
        title: 'Mountaintops of the Giants',
        missions: [
          { id: 'er_008', title: 'Fire Giant',                      type: 'main' },
          { id: 'er_009', title: 'Burn the Erdtree',                type: 'main' },
          { id: 'er_s13', title: 'Goldmask questline',              type: 'side' },
          { id: 'er_s14', title: 'Brother Corhyn questline',        type: 'side' },
        ],
      },
      {
        title: 'Crumbling Farum Azula',
        missions: [
          { id: 'er_010', title: 'Maliketh, the Black Blade',       type: 'main' },
          { id: 'er_011', title: 'Godfrey / Hoarah Loux',           type: 'main' },
        ],
      },
      {
        title: 'Leyndell, Ashen Capital',
        missions: [
          { id: 'er_012', title: 'Radagon of the Golden Order',     type: 'main' },
          { id: 'er_013', title: 'Elden Beast',                     type: 'main' },
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
          { id: 'w3_s01', title: 'Twisted Firestarter',             type: 'side' },
          { id: 'w3_s02', title: 'Missing In Action',               type: 'side' },
        ],
      },
      {
        title: 'Velen — No Man\'s Land',
        missions: [
          { id: 'w3_003', title: 'Bloody Baron',                    type: 'main' },
          { id: 'w3_004', title: 'Ladies of the Wood',              type: 'main' },
          { id: 'w3_005', title: 'Wandering in the Dark',           type: 'main' },
          { id: 'w3_006', title: 'In Ciri\'s Footsteps (Velen)',    type: 'main' },
          { id: 'w3_s03', title: 'A Dangerous Game',                type: 'side' },
          { id: 'w3_s04', title: 'An Eye For An Eye',               type: 'side' },
          { id: 'w3_s05', title: 'Ghosts of the Past',              type: 'side' },
        ],
      },
      {
        title: 'Novigrad',
        missions: [
          { id: 'w3_007', title: 'Pyres of Novigrad',               type: 'main' },
          { id: 'w3_008', title: 'Novigrad Dreaming',               type: 'main' },
          { id: 'w3_009', title: 'Get Junior',                      type: 'main' },
          { id: 'w3_010', title: 'Broken Flowers',                  type: 'main' },
          { id: 'w3_011', title: 'Count Reuven\'s Treasure',        type: 'main' },
          { id: 'w3_s06', title: 'Now or Never',                    type: 'side' },
          { id: 'w3_s07', title: 'Reason of State',                 type: 'side' },
        ],
      },
      {
        title: 'Skellige',
        missions: [
          { id: 'w3_012', title: 'Destination: Skellige',           type: 'main' },
          { id: 'w3_013', title: 'The King is Dead',                type: 'main' },
          { id: 'w3_014', title: 'Possession',                      type: 'main' },
          { id: 'w3_015', title: 'The Lord of Undvik',              type: 'main' },
          { id: 'w3_016', title: 'Missing Persons',                 type: 'main' },
          { id: 'w3_s08', title: 'King\'s Gambit',                  type: 'side' },
          { id: 'w3_s09', title: 'Practicum in Advanced Alchemy',   type: 'side' },
        ],
      },
      {
        title: 'The Isle of Mists & Kaer Morhen',
        missions: [
          { id: 'w3_017', title: 'The Isle of Mists',               type: 'main' },
          { id: 'w3_018', title: 'The Battle of Kaer Morhen',       type: 'main' },
          { id: 'w3_019', title: 'Blood on the Battlefield',        type: 'main' },
        ],
      },
      {
        title: 'Final Act',
        missions: [
          { id: 'w3_020', title: 'Final Preparations',              type: 'main' },
          { id: 'w3_021', title: 'Cat and Cuckoo',                  type: 'main' },
          { id: 'w3_022', title: 'Bald Mountain',                   type: 'main' },
          { id: 'w3_023', title: 'Something Ends, Something Begins',type: 'main' },
        ],
      },
    ],
  },

  'red-dead-redemption-2': {
    chapters: [
      {
        title: 'Prologue',
        missions: [
          { id: 'rdr2_001', title: 'Outlaws from the West',         type: 'main' },
          { id: 'rdr2_002', title: 'Enter, Pursued by a Memory',    type: 'main' },
          { id: 'rdr2_003', title: 'The Aftermath of Genesis',      type: 'main' },
          { id: 'rdr2_004', title: 'Old Friends',                   type: 'main' },
        ],
      },
      {
        title: 'Chapter 1 — Horseshoe Overlook',
        missions: [
          { id: 'rdr2_005', title: 'The Spines of America',         type: 'main' },
          { id: 'rdr2_006', title: 'Blessed are the Meek?',         type: 'main' },
          { id: 'rdr2_007', title: 'Polite Society, Valentine Style',type: 'main' },
          { id: 'rdr2_008', title: 'Americans at Rest',             type: 'main' },
          { id: 'rdr2_009', title: 'Who is Not Without Sin',        type: 'main' },
          { id: 'rdr2_010', title: 'A Quiet Time',                  type: 'main' },
          { id: 'rdr2_011', title: 'Exit Pursued by a Bruised Ego', type: 'main' },
        ],
      },
      {
        title: 'Chapter 2 — Clemens Point',
        missions: [
          { id: 'rdr2_012', title: 'The Sheep and the Goats',       type: 'main' },
          { id: 'rdr2_013', title: 'An American Pastoral Scene',    type: 'main' },
          { id: 'rdr2_014', title: 'The Fine Art of Conversation',  type: 'main' },
          { id: 'rdr2_015', title: 'The Heartlands Overflow',       type: 'main' },
          { id: 'rdr2_016', title: 'Pouring Forth Oil',             type: 'main' },
          { id: 'rdr2_017', title: 'Sodom? Back to Gomorrah',       type: 'main' },
          { id: 'rdr2_018', title: 'The Spines of America',         type: 'main' },
        ],
      },
      {
        title: 'Chapter 3 — Clemens Cove',
        missions: [
          { id: 'rdr2_019', title: 'The New South',                 type: 'main' },
          { id: 'rdr2_020', title: 'Further Questions of Female Suffrage', type: 'main' },
          { id: 'rdr2_021', title: 'Blood Feuds, Ancient and Modern', type: 'main' },
          { id: 'rdr2_022', title: 'The Course of True Love',       type: 'main' },
          { id: 'rdr2_023', title: 'Advertising, the New American Art', type: 'main' },
        ],
      },
      {
        title: 'Chapter 4 — Shady Belle',
        missions: [
          { id: 'rdr2_024', title: 'The Gilded Cage',               type: 'main' },
          { id: 'rdr2_025', title: 'A Fine Night of Debauchery',    type: 'main' },
          { id: 'rdr2_026', title: 'Urban Pleasures',               type: 'main' },
          { id: 'rdr2_027', title: 'Country Pursuits',              type: 'main' },
          { id: 'rdr2_028', title: 'Revenge is a Dish',             type: 'main' },
          { id: 'rdr2_029', title: 'Banking, the Old American Art', type: 'main' },
        ],
      },
      {
        title: 'Chapter 5 — Guarma',
        missions: [
          { id: 'rdr2_030', title: 'Welcome to the New World',      type: 'main' },
          { id: 'rdr2_031', title: 'A Kind and Benevolent Despot',  type: 'main' },
          { id: 'rdr2_032', title: 'Dear Uncle Tacitus',            type: 'main' },
          { id: 'rdr2_033', title: 'Savagery Unleashed',            type: 'main' },
          { id: 'rdr2_034', title: 'Hell Hath No Fury',             type: 'main' },
          { id: 'rdr2_035', title: 'Paradise Mercifully Departed',  type: 'main' },
        ],
      },
      {
        title: 'Chapter 6 — Beaver Hollow',
        missions: [
          { id: 'rdr2_036', title: 'Visiting Hours',                type: 'main' },
          { id: 'rdr2_037', title: 'The Bridge to Nowhere',         type: 'main' },
          { id: 'rdr2_038', title: 'Icarus and Friends',            type: 'main' },
          { id: 'rdr2_039', title: 'Of Men and Angels',             type: 'main' },
          { id: 'rdr2_040', title: 'My Last Boy',                   type: 'main' },
          { id: 'rdr2_041', title: 'Our Best Selves',               type: 'main' },
          { id: 'rdr2_042', title: 'Red Dead Redemption',           type: 'main' },
        ],
      },
      {
        title: 'Epilogue',
        missions: [
          { id: 'rdr2_043', title: 'The Wheel',                     type: 'main' },
          { id: 'rdr2_044', title: 'Farming, for Beginners',        type: 'main' },
          { id: 'rdr2_045', title: 'A New Jerusalem',               type: 'main' },
          { id: 'rdr2_046', title: 'American Venom',                type: 'main' },
        ],
      },
    ],
  },

  'cyberpunk-2077': {
    chapters: [
      {
        title: 'Act 1 — The Corpo-Rat / Street Kid / Nomad',
        missions: [
          { id: 'cp_001', title: 'The Nomad / The Corpo-Rat / The Street Kid', type: 'main' },
          { id: 'cp_002', title: 'The Rescue',                      type: 'main' },
          { id: 'cp_003', title: 'The Ride',                        type: 'main' },
          { id: 'cp_004', title: 'The Ripperdoc',                   type: 'main' },
          { id: 'cp_005', title: 'The Heist',                       type: 'main' },
        ],
      },
      {
        title: 'Act 2 — Night City',
        missions: [
          { id: 'cp_006', title: 'Playing for Time',                type: 'main' },
          { id: 'cp_007', title: 'Transmission',                    type: 'main' },
          { id: 'cp_008', title: 'Life During Wartime',             type: 'main' },
          { id: 'cp_009', title: 'Down on the Street',              type: 'main' },
          { id: 'cp_010', title: 'Gimme Danger',                    type: 'main' },
          { id: 'cp_011', title: 'Play It Safe',                    type: 'main' },
          { id: 'cp_012', title: 'Search and Destroy',              type: 'main' },
          { id: 'cp_013', title: 'Ghost Town',                      type: 'main' },
          { id: 'cp_014', title: 'Lightning Breaks',                type: 'main' },
          { id: 'cp_015', title: 'I Walk the Line',                 type: 'main' },
          { id: 'cp_016', title: 'Riders on the Storm',             type: 'main' },
          { id: 'cp_017', title: 'With a Little Help from My Friends', type: 'main' },
          { id: 'cp_s01', title: 'Automatic Love (Judy)',           type: 'side' },
          { id: 'cp_s02', title: 'The Space in Between (Judy)',     type: 'side' },
          { id: 'cp_s03', title: 'Judy — Ex-Factor',                type: 'side' },
          { id: 'cp_s04', title: 'Panam — Riders on the Storm',     type: 'side' },
          { id: 'cp_s05', title: 'River Ward questline',            type: 'side' },
          { id: 'cp_s06', title: 'Kerry Eurodyne questline',        type: 'side' },
        ],
      },
      {
        title: 'Act 3 — Endings',
        missions: [
          { id: 'cp_018', title: 'Nocturne Op55N1',                 type: 'main' },
          { id: 'cp_019', title: 'Ending — The Star',               type: 'main' },
          { id: 'cp_020', title: 'Ending — The Devil',              type: 'main' },
          { id: 'cp_021', title: 'Ending — The Sun',                type: 'main' },
          { id: 'cp_022', title: 'Ending — Temperance',             type: 'main' },
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
          { id: 'gow_011', title: 'A New Destination',              type: 'main' },
          { id: 'gow_012', title: 'Jötunheim in Reach',             type: 'main' },
          { id: 'gow_013', title: 'Mother\'s Ashes',                type: 'main' },
        ],
      },
      {
        title: 'Favors & Side Quests',
        missions: [
          { id: 'gow_s01', title: 'The Fire of Reginn (Dwarf favour)', type: 'side' },
          { id: 'gow_s02', title: 'Second Hand Soul',               type: 'side' },
          { id: 'gow_s03', title: 'Fafnir\'s Hoard',               type: 'side' },
          { id: 'gow_s04', title: 'Valkyrie — Eir',                 type: 'side' },
          { id: 'gow_s05', title: 'Valkyrie — Göndul',              type: 'side' },
          { id: 'gow_s06', title: 'Valkyrie — Geirdriful',          type: 'side' },
          { id: 'gow_s07', title: 'Valkyrie Queen — Sigrun',        type: 'side' },
        ],
      },
    ],
  },
};