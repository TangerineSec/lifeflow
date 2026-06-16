import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import Button from '../ui/Button';
import { importBackup } from '../../utils/backup';

/**
 * 批量导入对话框
 * 支持：
 * 1. 通过 JSON 文件导入
 * 2. 通过表单手动输入模版数据
 */
export default function ImportDialog({ onClose }) {
  const batchImportFlows = useFlowStore((s) => s.batchImportFlows);
  const [importMode, setImportMode] = useState('file'); // 'file' | 'form'
  const [formText, setFormText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileImport = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await importBackup();
      if (!data.flows && !data.templates) {
        setError('无效的备份文件：缺少 flows 或 templates 字段');
        return;
      }
      if (data.flows) {
        const flowsData = Object.values(data.flows).map((f) => ({
          title: f.title,
          quadrant: f.quadrant,
          nodes: f.nodes
            .map((nid) => (data.nodes || {})[nid])
            .filter(Boolean),
        }));
        batchImportFlows(flowsData);
      }
      onClose();
    } catch (err) {
      setError(err.message || '导入失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFormImport = () => {
    try {
      setError('');
      const parsed = JSON.parse(formText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      batchImportFlows(
        items.map((item) => ({
          title: item.title || '导入的流程',
          quadrant: item.quadrant || 'life',
          nodes: item.nodes || [],
        }))
      );
      onClose();
    } catch (err) {
      setError('JSON 格式错误，请检查后重试');
    }
  };

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="flex gap-1 p-0.5 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setImportMode('file')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            importMode === 'file'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          从文件导入
        </button>
        <button
          onClick={() => setImportMode('form')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            importMode === 'form'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          JSON 粘贴
        </button>
      </div>

      {/* 文件导入模式 */}
      {importMode === 'file' && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-brand-300 transition-colors">
          <Upload size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 mb-1">选择 LifeFlow 备份 JSON 文件</p>
          <p className="text-xs text-gray-400 mb-4">
            支持 .json 格式的备份数据
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={handleFileImport}
            disabled={loading}
          >
            {loading ? '导入中...' : '选择文件'}
          </Button>
        </div>
      )}

      {/* 表单模式 */}
      {importMode === 'form' && (
        <div className="space-y-2">
          <textarea
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                       transition-all duration-150 resize-none"
            placeholder='[
  {
    "title": "我的流程",
    "quadrant": "work",
    "nodes": [
      {
        "title": "第一步",
        "description": "描述",
        "status": "pending",
        "children": [],
        "checklist": []
      }
    ]
  }
]'
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              粘贴 JSON 数组，每个元素为一个流程
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFormImport}
              disabled={!formText.trim()}
            >
              导入
            </Button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
