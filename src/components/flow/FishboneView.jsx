import { useState, useMemo, useRef, useEffect } from 'react';
import useFlowStore from '../../store/useFlowStore';

/**
 * =========================================================
 * FishboneView — 鱼骨图（Ishikawa Diagram）预览组件
 * =========================================================
 *
 * 使用 SVG 绘制鱼骨图，将流程的层级结构以鱼骨形式可视化展示。
 * 主轴（Spine）水平居中贯穿，代表流程的总目标。
 * 主分支（Main Bones）从主轴上下两侧斜向延伸，代表顶层节点。
 * 子分支（Sub-bones）从主分支向中心主轴方向延伸，形成鱼刺层级。
 *
 * ═══════════════════════════════════════════════════════════
 * 坐标计算体系（鱼骨图核心算法）：
 *
 *   1. 主轴（Spine）:
 *      水平线，Y = viewHeight / 2，从 paddingLeft 到 viewWidth - paddingRight
 *
 *   2. 主分支（Main Bones - 一级节点）:
 *      每个根节点占据主轴上的一个等分段。
 *      节点 i 的锚点 X = 主轴起点 + (i + 1) * 分段宽度
 *      方向交替：i%2===0 向上，i%2===1 向下
 *      分支线从锚点以约 40° 角向外延伸，长度由子节点数量决定：
 *        baseLength = 80 + childCount * 20，范围 [80, 200]
 *
 *   3. 子分支（Sub-bones - 二级及以下节点）:
 *      从主分支上的等分点（t ∈ [0.2, 0.8]）出发，
 *      沿主分支法线方向（朝向主轴中线）延伸，
 *      长度 = 25 + 标题长度 * 3，范围 [30, 100]
 *
 *   4. 三级及以上节点：
 *      从子分支末端再延伸更短的小刺（第三级简化处理）。
 * ═══════════════════════════════════════════════════════════
 *
 * @param {string} flowId - 流程图 ID
 */

// ─── 鱼骨图坐标计算函数（模块级纯函数） ───

/**
 * 计算鱼骨图所有元素的坐标
 *
 * @param {Object} flow - flow 对象
 * @param {Array} rootNodes - 按 order 排序的根节点列表
 * @param {Object} allNodes - 所有节点的映射表 { [nodeId]: Node }
 * @param {number} width - SVG 画布宽度
 * @param {number} height - SVG 画布高度
 * @returns {Object} { spine, bones }
 *
 * 返回结构：
 * - spine: { x1, y1, x2, y2 } — 主轴起止坐标
 * - bones: [{
 *     nodeId, title, status,
 *     spineX, spineY,         // 主分支在主轴上的锚点
 *     tipX, tipY,             // 主分支末端坐标
 *     children: [{            // 子分支列表
 *       nodeId, title, status,
 *       startX, startY,       // 子分支在主分支上的起点
 *       endX, endY            // 子分支末端坐标
 *     }]
 *   }]
 */
function calcFishboneLayout(flow, rootNodes, allNodes, width, height) {
  // 内边距
  const pad = { top: 60, bottom: 50, left: 60, right: 40 };
  const spineY = height / 2;
  const spineLeft = pad.left;
  const spineRight = width - pad.right;

  const result = {
    // 主轴：一条水平直线，右侧带有箭头
    spine: { x1: spineLeft, y1: spineY, x2: spineRight, y2: spineY },
    bones: [],
  };

  const numRoots = rootNodes.length;
  if (numRoots === 0) return result;

  // 主轴分段宽度（每两个节点之间）
  const segmentWidth = (spineRight - spineLeft) / (numRoots + 1);

  rootNodes.forEach((node, i) => {
    // 该主分支在主轴上的锚点位置
    const spineX = spineLeft + segmentWidth * (i + 1);

    // 方向：交替上下
    const isUp = i % 2 === 0;

    // 分支长度：子节点越多，分支越长
    const childCount = node.children ? node.children.length : 0;
    const boneLen = Math.max(80, Math.min(200, 80 + childCount * 20));

    // 主分支末端坐标（约 40° 角斜向延伸）
    // 水平偏移：boneLen * cos(40°) ≈ boneLen * 0.766
    // 垂直偏移：boneLen * sin(40°) ≈ boneLen * 0.643
    const tipX = spineX + boneLen * 0.25 * (isUp ? -1 : 1);
    const tipY = spineY + boneLen * 0.65 * (isUp ? -1 : 1);

    const bone = {
      nodeId: node.id,
      title: node.title,
      status: node.status,
      spineX,
      spineY,
      tipX,
      tipY,
      children: [],
    };

    // ── 计算子分支坐标 ──
    // 子分支从主分支的等分点出发，沿法线方向（朝向主轴中线）延伸
    const children = node.children
      .map((cid) => allNodes[cid])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);

    children.forEach((child, j) => {
      // 子分支在主分支上的位置比例 t ∈ [0.25, 0.75]
      const t = 0.25 + (j / Math.max(children.length - 1, 1)) * 0.5;
      const startX = spineX + (tipX - spineX) * t;
      const startY = spineY + (tipY - spineY) * t;

      // 法线方向：主分支方向的垂直向量，指向主轴中线
      const dx = tipX - spineX;
      const dy = tipY - spineY;
      const len = Math.sqrt(dx * dx + dy * dy);
      // 法线（垂直方向，朝向主轴）
      const nx = -dy / len;
      const ny = dx / len;

      // 子分支长度
      const subLen = Math.max(30, Math.min(80, 25 + child.title.length * 3));

      // 子分支端点坐标
      const endX = startX + nx * subLen;
      const endY = startY + ny * subLen;

      bone.children.push({
        nodeId: child.id,
        title: child.title,
        status: child.status,
        startX,
        startY,
        endX,
        endY,
      });
    });

    result.bones.push(bone);
  });

  return result;
}

export default function FishboneView({ flowId }) {
  const flow = useFlowStore((s) => s.flows[flowId]);
  const nodes = useFlowStore((s) => s.nodes);

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // 响应式尺寸：监听容器宽度，按比例计算高度
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = entry.contentRect.width;
        // 高度根据节点数量自适应：最少 350px，每多 2 个节点增加 40px
        const numBones = flow ? flow.nodes.length : 0;
        const h = Math.max(350, Math.min(700, 350 + Math.floor(numBones / 2) * 40));
        setDimensions({ width: w, height: h });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [flow]);

  // 按 order 排序的根节点列表
  const sortedRootNodes = useMemo(() => {
    if (!flow) return [];
    return flow.nodes
      .map((id) => nodes[id])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);
  }, [flow, nodes]);

  // 计算鱼骨图布局坐标
  const layout = useMemo(() => {
    if (!flow || sortedRootNodes.length === 0) return null;
    return calcFishboneLayout(
      flow,
      sortedRootNodes,
      nodes,
      dimensions.width,
      dimensions.height
    );
  }, [flow, sortedRootNodes, nodes, dimensions]);

  if (!flow || !layout) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        暂无数据可生成鱼骨图
      </div>
    );
  }

  const { spine, bones } = layout;

  return (
    <div ref={containerRef} className="w-full">
      {/* 鱼骨图提示横幅 */}
      <div className="mb-3 px-4 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-center gap-2">
        <span>💡</span>
        <span>鱼骨图为只读预览模式，可清晰展示层级关系。编辑请切换到线性流程图。</span>
      </div>

      {/* SVG 画布 */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="bg-white rounded-xl border border-gray-100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── 右侧标题（鱼头方向：代表总目标） ── */}
        <text
          x={dimensions.width - 40}
          y={dimensions.height / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className="text-sm font-semibold"
          fill="#1e293b"
        >
          {flow.title}
        </text>

        {/* ── 主轴（Spine）─ 水平贯穿的脊线 ── */}
        <line
          x1={spine.x1}
          y1={spine.y1}
          x2={spine.x2}
          y2={spine.y2}
          stroke="#94a3b8"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* ── 主轴箭头（指向鱼头/目标） ── */}
        <polygon
          points={`${spine.x2},${spine.y2} ${spine.x2 - 10},${spine.y2 - 5} ${spine.x2 - 10},${spine.y2 + 5}`}
          fill="#94a3b8"
        />

        {/* ── 主分支（Main Bones）与子分支（Sub-bones） ── */}
        {bones.map((bone) => (
          <g key={bone.nodeId}>
            {/* 子分支连接线（先绘制，使它们位于主分支下方） */}
            {bone.children.map((child) => (
              <g key={child.nodeId}>
                {/* 子分支线 */}
                <line
                  x1={child.startX}
                  y1={child.startY}
                  x2={child.endX}
                  y2={child.endY}
                  stroke={
                    child.status === 'completed' ? '#059669' : '#94a3b8'
                  }
                  strokeWidth={child.status === 'completed' ? 2 : 1.5}
                  strokeLinecap="round"
                  opacity={child.status === 'completed' ? 0.8 : 0.6}
                />
                {/* 子分支末端圆点 */}
                <circle
                  cx={child.endX}
                  cy={child.endY}
                  r={4}
                  fill={
                    child.status === 'completed' ? '#059669' : '#cbd5e1'
                  }
                  stroke="white"
                  strokeWidth={1.5}
                />
                {/* 子分支标签 */}
                <text
                  x={child.endX + (child.endX > child.startX ? 8 : -8)}
                  y={child.endY}
                  textAnchor={
                    child.endX > child.startX ? 'start' : 'end'
                  }
                  dominantBaseline="middle"
                  fontSize={10}
                  fill={child.status === 'completed' ? '#065f46' : '#64748b'}
                  className="select-none"
                >
                  {child.title.length > 10
                    ? child.title.slice(0, 10) + '…'
                    : child.title}
                </text>
              </g>
            ))}

            {/* 主分支线（从主轴到分支末端） */}
            <line
              x1={bone.spineX}
              y1={bone.spineY}
              x2={bone.tipX}
              y2={bone.tipY}
              stroke={bone.status === 'completed' ? '#059669' : '#64748b'}
              strokeWidth={bone.status === 'completed' ? 2.5 : 2}
              strokeLinecap="round"
            />

            {/* 主分支末端圆点 */}
            <circle
              cx={bone.tipX}
              cy={bone.tipY}
              r={6}
              fill={bone.status === 'completed' ? '#059669' : '#64748b'}
              stroke="white"
              strokeWidth={2}
            />

            {/* 主分支标签（节点标题） */}
            <text
              x={bone.tipX + (bone.tipX > bone.spineX ? 10 : -10)}
              y={bone.tipY}
              textAnchor={
                bone.tipX > bone.spineX ? 'start' : 'end'
              }
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill={bone.status === 'completed' ? '#065f46' : '#334155'}
              className="select-none"
            >
              {bone.title.length > 14
                ? bone.title.slice(0, 14) + '…'
                : bone.title}
            </text>

            {/* 状态指示标记 */}
            {bone.status === 'completed' && (
              <text
                x={bone.tipX}
                y={bone.tipY + (bone.tipY > bone.spineY ? 18 : -18)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill="#059669"
                className="select-none"
              >
                ✓
              </text>
            )}
          </g>
        ))}

        {/* ── 空状态提示（只有主轴没有分支时） ── */}
        {bones.length === 0 && (
          <text
            x={dimensions.width / 2}
            y={dimensions.height / 2 + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#94a3b8"
          >
            暂无节点，请在流程图编辑模式下添加
          </text>
        )}
      </svg>
    </div>
  );
}
