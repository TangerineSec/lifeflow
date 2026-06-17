/**
 * =========================================================
 * sync — Supabase 数据同步服务
 * =========================================================
 *
 * Local-First 同步策略：
 *   - 所有数据操作先写入本地 Zustand store（即时响应）
 *   - Zustand persist 中间件自动保存到 localStorage（离线可用）
 *   - 同步服务在后台将数据推送到 Supabase（跨设备共享）
 *
 * 同步时机：
 *   - 登录成功 → pullFromCloud()：从云端拉取，本地为空或云端更新时覆盖
 *   - 数据变更 → pushToCloud()：debounce 1 秒后推送到云端
 *
 * 冲突策略：云端优先（基于 updated_at 时间戳比较）
 *
 * 数据存储格式（user_data.data）：
 *   {
 *     "flows": { ... },     // 所有流程图
 *     "nodes": { ... },     // 所有节点
 *     "templates": [...]    // 用户自建模版
 *   }
 *
 * 注意：DEFAULT_TEMPLATES 是预设模版，不上传到云端。
 * 只有用户通过「保存为模版」创建的模版才同步。
 */

import { supabase } from './supabase';

// 防抖定时器
let pushTimer = null;

/**
 * 从 Supabase 拉取用户数据
 * @param {string} userId - 用户 ID
 * @returns {Promise<{ flows: Object, nodes: Object, templates: Array } | null>}
 */
export async function pullFromCloud(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = 没有找到记录（用户首次使用，云端无数据）
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      flows: data.data?.flows || {},
      nodes: data.data?.nodes || {},
      templates: data.data?.templates || [],
      updatedAt: new Date(data.updated_at).getTime(),
    };
  } catch (err) {
    console.error('[Sync] 拉取数据失败:', err);
    throw err;
  }
}

/**
 * 推送数据到 Supabase（UPSERT：有则更新，无则插入）
 * @param {string} userId - 用户 ID
 * @param {Object} flows - 所有流程图
 * @param {Object} nodes - 所有节点
 * @param {Array} templates - 用户模版
 * @returns {Promise<boolean>}
 */
export async function pushToCloud(userId, { flows, nodes, templates }) {
  if (!userId) return false;

  try {
    const payload = {
      data: { flows, nodes, templates },
    };

    // 检查是否已有记录
    const { data: existing } = await supabase
      .from('user_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // 已有记录 → 更新
      const { error } = await supabase
        .from('user_data')
        .update(payload)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // 无记录 → 插入
      const { error } = await supabase
        .from('user_data')
        .insert({ user_id: userId, ...payload });

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('[Sync] 推送数据失败:', err);
    return false;
  }
}

/**
 * 防抖推送：多次连续调用会合并为一次推送
 * @param {string} userId - 用户 ID
 * @param {Function} getStoreData - 获取当前 store 数据的函数
 */
export function debouncedPush(userId, getStoreData) {
  if (pushTimer) clearTimeout(pushTimer);

  pushTimer = setTimeout(async () => {
    if (!userId) return;

    const { flows, nodes, templates } = getStoreData();
    const ok = await pushToCloud(userId, { flows, nodes, templates });

    if (ok) {
      // 推送成功后更新 lastSyncedAt（通过自定义事件通知 UI）
      window.dispatchEvent(
        new CustomEvent('lifeflow-sync', { detail: { status: 'synced', time: Date.now() } })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent('lifeflow-sync', { detail: { status: 'error', time: Date.now() } })
      );
    }
  }, 1000); // 1 秒防抖
}

/**
 * 取消待处理的推送
 */
export function cancelPendingPush() {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}

/**
 * 检查云端是否有比本地更新的数据
 * @param {string} userId
 * @param {number} localUpdatedAt - 本地数据的最新更新时间
 * @returns {Promise<boolean>}
 */
export async function hasNewerCloudData(userId, localUpdatedAt) {
  if (!userId) return false;

  try {
    const { data } = await supabase
      .from('user_data')
      .select('updated_at')
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    const cloudTime = new Date(data.updated_at).getTime();
    return cloudTime > (localUpdatedAt || 0);
  } catch {
    return false;
  }
}
