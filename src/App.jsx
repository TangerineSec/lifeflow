import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import NodeDetail from './components/flow/NodeDetail';
import FlowInfoModal from './components/flow/FlowInfoModal';
import DataInitializer from './components/layout/DataInitializer';
import TemplateManager from './components/template/TemplateManager';

/**
 * LifeFlow 主应用组件
 *
 * 布局结构：
 * ┌─────────────────────────────────────┐
 * │  Header（固定顶部）                  │
 * ├─────────────────────┬───────────────┤
 * │  Dashboard          │  NodeDetail   │
 * │  (主内容区/流程详情)  │  (右侧抽屉)   │
 * │                     │               │
 * └─────────────────────┴───────────────┘
 *  ├── FlowInfoModal (流程简介弹窗)
 *  └── TemplateManager (模版库弹窗)
 */
function App() {
  return (
    <DataInitializer>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Dashboard />
        <NodeDetail />
        <FlowInfoModal />
        <TemplateManager />
      </div>
    </DataInitializer>
  );
}

export default App;
