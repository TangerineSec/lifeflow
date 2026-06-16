import { motion } from 'framer-motion';
import { Briefcase, BookOpen, Heart, Sparkles, Layers } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import Button from '../ui/Button';

const ICON_MAP = {
  Target: Layers,
  Code2: Layers,
  MapPin: Layers,
  Heart: Heart,
  FileText: Layers,
};

const QUAD_COLORS = {
  work: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  study: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  life: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  hobby: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
};

const QUAD_LABELS = { work: '工作', study: '学习', life: '生活', hobby: '兴趣' };

/**
 * 单个模版卡片
 * 展示模版的基本信息，支持「加载到工作区」和「删除」操作
 */
export default function TemplateCard({ template, onLoad, onDelete }) {
  const qColor = QUAD_COLORS[template.quadrant] || QUAD_COLORS.life;
  const nodeCount = countNodes(template.nodes);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 hover:shadow-md transition-all duration-200 group"
    >
      {/* 顶部标识 */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${qColor.bg} ${qColor.text}`}>
          <Layers size={18} />
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${qColor.bg} ${qColor.text}`}>
          {QUAD_LABELS[template.quadrant]}
        </span>
      </div>

      {/* 名称与描述 */}
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{template.name}</h3>
      <p className="text-xs text-gray-400 line-clamp-2 mb-3 min-h-[2em]">
        {template.description || '暂无描述'}
      </p>

      {/* 节点统计 */}
      <div className="text-[11px] text-gray-400 mb-3">
        {nodeCount} 个节点
      </div>

      {/* 操作按钮（hover 显示） */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onLoad(template)}
        >
          加载到工作区
        </Button>
        {!template.id?.startsWith('tpl_') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template.id)}
          >
            删除
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/** 递归统计节点数量 */
function countNodes(nodes) {
  if (!nodes || !Array.isArray(nodes)) return 0;
  let count = nodes.length;
  nodes.forEach((n) => {
    if (n.children && n.children.length > 0) {
      count += countNodes(n.children);
    }
  });
  return count;
}
