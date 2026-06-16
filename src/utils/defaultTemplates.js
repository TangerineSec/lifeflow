import { genId } from './id';

/**
 * 预设模版库
 * 每个模版包含完整的节点数据，导入后直接可用
 */
export const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_annual',
    name: '年度目标',
    quadrant: 'life',
    icon: 'Target',
    description: '制定并追踪年度核心目标，拆解为季度和月度里程碑',
    nodes: [
      {
        id: 'node_q1',
        title: 'Q1 季度目标',
        description: '第一季度核心里程碑',
        status: 'completed',
        order: 0,
        children: [
          {
            id: 'node_jan',
            title: '一月：规划与启动',
            description: '确定年度方向，启动关键项目',
            status: 'completed',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '制定年度 OKR', done: true },
              { id: genId(), text: '预算规划与资源配置', done: true },
              { id: genId(), text: '购买所需工具/订阅', done: false },
            ],
          },
          {
            id: 'node_feb',
            title: '二月：执行与调整',
            description: '推进项目，根据反馈调整策略',
            status: 'completed',
            order: 1,
            children: [],
            checklist: [
              { id: genId(), text: '项目启动会', done: true },
              { id: genId(), text: '第一轮里程碑检查', done: true },
            ],
          },
          {
            id: 'node_mar',
            title: '三月：复盘与迭代',
            description: 'Q1 复盘，调整 Q2 计划',
            status: 'pending',
            order: 2,
            children: [],
            checklist: [
              { id: genId(), text: 'Q1 数据汇总', done: false },
              { id: genId(), text: '撰写 Q1 复盘报告', done: false },
              { id: genId(), text: '制定 Q2 调整方案', done: false },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: 'Q1 目标达成率 ≥ 80%', done: false },
        ],
      },
      {
        id: 'node_q2',
        title: 'Q2 季度目标',
        description: '第二季度核心里程碑',
        status: 'pending',
        order: 1,
        children: [
          {
            id: 'node_apr',
            title: '四月：深耕核心项目',
            description: '将资源聚焦到高优先级事务',
            status: 'pending',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '确认 Q2 优先级排序', done: false },
              { id: genId(), text: '启动核心项目执行', done: false },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: 'Q2 目标拆解完成', done: false },
        ],
      },
      {
        id: 'node_q3',
        title: 'Q3 季度目标',
        description: '第三季度核心里程碑（预留）',
        status: 'pending',
        order: 2,
        children: [],
        checklist: [],
      },
      {
        id: 'node_q4',
        title: 'Q4 季度目标',
        description: '第四季度冲刺与年度收官',
        status: 'pending',
        order: 3,
        children: [],
        checklist: [
          { id: genId(), text: '年度目标完成度评估', done: false },
          { id: genId(), text: '制定下一年初步计划', done: false },
        ],
      },
    ],
  },
  {
    id: 'tpl_project',
    name: '项目开发',
    quadrant: 'work',
    icon: 'Code2',
    description: '标准软件项目开发流程，从需求到上线',
    nodes: [
      {
        id: 'node_req',
        title: '需求分析',
        description: '收集和分析项目需求',
        status: 'completed',
        order: 0,
        children: [
          {
            id: 'node_req_user',
            title: '用户调研',
            description: '通过访谈和问卷了解用户痛点',
            status: 'completed',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '设计调研问卷', done: true },
              { id: genId(), text: '执行 5 场用户访谈', done: true },
              { id: genId(), text: '整理调研报告', done: true },
            ],
          },
          {
            id: 'node_req_prd',
            title: '撰写 PRD',
            description: '产品需求文档',
            status: 'completed',
            order: 1,
            children: [],
            checklist: [
              { id: genId(), text: '编写功能列表', done: true },
              { id: genId(), text: '绘制用户流程图', done: true },
              { id: genId(), text: 'PRD 评审', done: true },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: '需求文档评审通过', done: true },
        ],
      },
      {
        id: 'node_design',
        title: '设计',
        description: 'UI/UX 设计与评审',
        status: 'completed',
        order: 1,
        children: [
          {
            id: 'node_design_wire',
            title: '线框图',
            description: '低保真原型',
            status: 'completed',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '绘制主要页面线框图', done: true },
            ],
          },
          {
            id: 'node_design_hi',
            title: '高保真设计',
            description: 'Figma 高保真设计稿',
            status: 'pending',
            order: 1,
            children: [],
            checklist: [
              { id: genId(), text: '设计系统组件', done: false },
              { id: genId(), text: '所有页面的高保真稿', done: false },
              { id: genId(), text: '设计评审', done: false },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: '设计稿评审通过', done: false },
        ],
      },
      {
        id: 'node_dev',
        title: '开发',
        description: '前后端开发与联调',
        status: 'pending',
        order: 2,
        children: [],
        checklist: [
          { id: genId(), text: '搭建项目脚手架', done: false },
          { id: genId(), text: '实现核心功能模块', done: false },
          { id: genId(), text: '前后端联调', done: false },
        ],
      },
      {
        id: 'node_test',
        title: '测试',
        description: '功能测试与修复',
        status: 'pending',
        order: 3,
        children: [],
        checklist: [
          { id: genId(), text: '编写测试用例', done: false },
          { id: genId(), text: '执行全量回归测试', done: false },
          { id: genId(), text: 'Bug 修复与验证', done: false },
        ],
      },
      {
        id: 'node_launch',
        title: '上线发布',
        description: '生产环境部署与监控',
        status: 'pending',
        order: 4,
        children: [],
        checklist: [
          { id: genId(), text: '部署流程检查', done: false },
          { id: genId(), text: '线上监控配置', done: false },
          { id: genId(), text: '发布公告', done: false },
        ],
      },
    ],
  },
  {
    id: 'tpl_travel',
    name: '旅行规划',
    quadrant: 'life',
    icon: 'MapPin',
    description: '完整的旅行规划流程，从目的地选择到行程执行',
    nodes: [
      {
        id: 'node_dest',
        title: '目的地选择',
        description: '确定旅行目的地和出行时间',
        status: 'completed',
        order: 0,
        children: [],
        checklist: [
          { id: genId(), text: '确定目的地候选列表', done: true },
          { id: genId(), text: '查签证要求', done: true },
          { id: genId(), text: '确定出行日期', done: true },
        ],
      },
      {
        id: 'node_booking',
        title: '预订',
        description: '交通和住宿预订',
        status: 'pending',
        order: 1,
        children: [
          {
            id: 'node_flight',
            title: '机票/火车票',
            description: '比价并预订交通',
            status: 'pending',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '比价搜索', done: false },
              { id: genId(), text: '预订并支付', done: false },
              { id: genId(), text: '行程单保存', done: false },
            ],
          },
          {
            id: 'node_hotel',
            title: '住宿',
            description: '预订酒店或民宿',
            status: 'pending',
            order: 1,
            children: [],
            checklist: [
              { id: genId(), text: '筛选住宿选项', done: false },
              { id: genId(), text: '查看住客评价', done: false },
              { id: genId(), text: '完成预订', done: false },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: '交通预订确认', done: false },
          { id: genId(), text: '住宿预订确认', done: false },
        ],
      },
      {
        id: 'node_itinerary',
        title: '行程规划',
        description: '细化每日行程安排',
        status: 'pending',
        order: 2,
        children: [],
        checklist: [
          { id: genId(), text: '制定每日行程草稿', done: false },
          { id: genId(), text: '标注必去景点', done: false },
          { id: genId(), text: '预算规划', done: false },
        ],
      },
      {
        id: 'node_prepare',
        title: '出行准备',
        description: '行李打包和行前准备',
        status: 'pending',
        order: 3,
        children: [],
        checklist: [
          { id: genId(), text: '收拾行李', done: false },
          { id: genId(), text: '检查证件和保险', done: false },
          { id: genId(), text: '下载离线地图', done: false },
        ],
      },
    ],
  },
  {
    id: 'tpl_habit',
    name: '习惯养成',
    quadrant: 'hobby',
    icon: 'Heart',
    description: '科学养成新习惯的 21 天追踪流程',
    nodes: [
      {
        id: 'node_week1',
        title: '第一周：适应期',
        description: '让新习惯融入日常生活（最困难的阶段）',
        status: 'completed',
        order: 0,
        children: [
          {
            id: 'node_day1',
            title: '第 1-2 天：启动',
            description: '设定最小可行目标，降低心理门槛',
            status: 'completed',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '确定习惯触发动作', done: true },
              { id: genId(), text: '完成首次执行', done: true },
            ],
          },
          {
            id: 'node_day3_7',
            title: '第 3-7 天：建立节奏',
            description: '固定时间和地点执行，形成规律',
            status: 'pending',
            order: 1,
            children: [],
            checklist: [
              { id: genId(), text: '连续执行 5 天', done: false },
              { id: genId(), text: '记录执行感受', done: false },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: '第一周执行率 ≥ 60%', done: true },
        ],
      },
      {
        id: 'node_week2',
        title: '第二周：巩固期',
        description: '增加难度，构建正向反馈回路',
        status: 'pending',
        order: 1,
        children: [
          {
            id: 'node_day8_10',
            title: '第 8-10 天：小挑战',
            description: '尝试增加 10% 的难度',
            status: 'pending',
            order: 0,
            children: [],
            checklist: [
              { id: genId(), text: '执行率保持 70%+', done: false },
              { id: genId(), text: '记录突破时刻', done: false },
            ],
          },
        ],
        checklist: [
          { id: genId(), text: '第二周执行率 ≥ 70%', done: false },
        ],
      },
      {
        id: 'node_week3',
        title: '第三周：自动化期',
        description: '习惯逐渐变成无需思考的自动行为',
        status: 'pending',
        order: 2,
        children: [],
        checklist: [
          { id: genId(), text: '执行率 ≥ 80%', done: false },
          { id: genId(), text: '回顾 21 天总结', done: false },
        ],
      },
    ],
  },
];

/**
 * 将预设模版中的嵌套节点展开为扁平化存储格式
 * 用于导入到 store 中
 */
export function flattenTemplateNodes(templateNodes, flowId) {
  const flatNodes = {};
  const rootIds = [];

  function flatten(node, parentNodeId) {
    const { children, checklist, ...rest } = node;
    const nodeId = node.id || genId();

    flatNodes[nodeId] = {
      ...rest,
      id: nodeId,
      parentFlow: flowId,
      parentNode: parentNodeId || null,
      children: [],
      checklist: checklist || [],
    };

    if (!parentNodeId) {
      rootIds.push(nodeId);
    }

    if (children && children.length > 0) {
      const childIds = [];
      children.forEach((child) => {
        const childId = flatten(child, nodeId);
        childIds.push(childId);
      });
      flatNodes[nodeId].children = childIds;
    }

    return nodeId;
  }

  templateNodes.forEach((node) => flatten(node, null));

  return { flatNodes, rootIds };
}
