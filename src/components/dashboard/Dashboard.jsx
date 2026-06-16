import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import TabNav from './TabNav';
import WorkSection from './WorkSection';
import GenericSection from './GenericSection';
import FlowDetailView from '../flow/FlowDetailView';

/**
 * 首页仪表盘 — 四象限分区容器
 *
 * 当 viewingFlowId 不为空时，显示流程详情视图而非仪表盘
 */
export default function Dashboard() {
  const activeQuadrant = useAppStore((s) => s.activeQuadrant);
  const viewingFlowId = useAppStore((s) => s.viewingFlowId);

  // 正在查看流程详情 → 显示流程图全屏视图
  if (viewingFlowId) {
    return <FlowDetailView />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Tab 导航 */}
      <div className="mb-6">
        <TabNav />
      </div>

      {/* 象限内容区 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeQuadrant}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeQuadrant === 'work' ? (
            <WorkSection />
          ) : (
            <GenericSection quadrant={activeQuadrant} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
