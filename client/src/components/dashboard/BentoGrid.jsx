import { motion }        from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion.js';
import { NowPlayingCard }     from './cards/NowPlayingCard.jsx';
import { StatsCard }          from './cards/StatsCard.jsx';
import { BacklogCard }        from './cards/BacklogCard.jsx';
import { RecentActivityCard } from './cards/RecentActivityCard.jsx';
import { CommunityCard }      from './cards/CommunityCard.jsx';
import { SteamSyncCard }      from './cards/SteamSyncCard.jsx';
import { PileOfShameCard }    from './cards/PileOfShameCard.jsx';
import { PlaytimeCharts }     from '../charts/PlaytimeCharts.jsx';

export const BentoGrid = () => (
  <motion.div
    variants={staggerContainer(0.06, 0.1)}
    initial="initial"
    animate="animate"
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
  >
    <motion.div variants={staggerItem} className="lg:col-span-2">
      <NowPlayingCard />
    </motion.div>
    <motion.div variants={staggerItem}>
      <StatsCard />
    </motion.div>

    <motion.div variants={staggerItem}>
      <SteamSyncCard />
    </motion.div>
    <motion.div variants={staggerItem} className="lg:col-span-2">
      <BacklogCard />
    </motion.div>

    <motion.div variants={staggerItem} className="lg:col-span-3">
      <PlaytimeCharts />
    </motion.div>

    <motion.div variants={staggerItem}>
      <RecentActivityCard />
    </motion.div>
    <motion.div variants={staggerItem} className="lg:col-span-2">
      <PileOfShameCard />
    </motion.div>

    <motion.div variants={staggerItem} className="lg:col-span-3">
      <CommunityCard />
    </motion.div>
  </motion.div>
);