import { useEffect } from 'react';
import useFlowStore from '../../store/useFlowStore';

/**
 * 在应用启动时加载预设模版数据
 * 如果 store 中没有任何 flow，则初始化预设数据
 * 这个组件不渲染任何 UI，只在挂载时触发一次数据初始化
 */
export default function DataInitializer({ children }) {
  const loadDefaultTemplates = useFlowStore((s) => s.loadDefaultTemplates);

  useEffect(() => {
    loadDefaultTemplates();
  }, []);

  return children;
}
