import { Plus, FolderPlus } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import Button from '../ui/Button';

/**
 * 流程图操作栏
 * 包含添加节点、导入模版等操作
 */
export default function FlowControls({ flowId }) {
  const addNode = useFlowStore((s) => s.addNode);
  const openModal = useAppStore((s) => s.openModal);

  const handleAddNode = () => {
    addNode({
      title: '新节点',
      parentFlow: flowId,
      parentNode: null,
    });
  };

  const handleLoadTemplate = () => {
    openModal('template', { flowId });
  };

  return (
    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
      <Button
        variant="primary"
        size="sm"
        icon={Plus}
        onClick={handleAddNode}
      >
        添加节点
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={FolderPlus}
        onClick={handleLoadTemplate}
      >
        从模版导入
      </Button>
    </div>
  );
}
