/**
 * =========================================================
 * LifeFlow → user_data 表
 * =========================================================
 *
 * 用途：存储用户的完整工作区数据（流程图、节点、模版）
 * 将数据从浏览器 localStorage 迁移到云端，实现多设备同步。
 *
 * 数据模型：
 *   data 列是 JSONB 类型，结构如下：
 *   {
 *     "flows": { [flowId]: Flow },
 *     "nodes": { [nodeId]: Node },
 *     "templates": Template[]
 *   }
 *
 * 同步策略：
 *   每次数据变更时，Zustand store 触发 debounced 写入此表
 *   登录时从此表拉取最新数据覆盖本地状态
 *
 * 使用 Supabase SQL Editor 执行下面的 SQL。
 */

-- =============================================
-- 1. 创建 user_data 表
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 每个用户只能有一行数据
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data (user_id);

-- =============================================
-- 2. 启用行级安全（RLS）
-- =============================================
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RLS 策略
-- =============================================

-- 用户可以读取自己的数据
CREATE POLICY "用户可读取自己的数据"
  ON public.user_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的数据（注册后的首次同步）
CREATE POLICY "用户可插入自己的数据"
  ON public.user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的数据
CREATE POLICY "用户可更新自己的数据"
  ON public.user_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. 自动更新 updated_at 触发器
-- =============================================
CREATE OR REPLACE FUNCTION public.update_user_data_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_user_data_updated_at ON public.user_data;
CREATE TRIGGER trigger_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_data_timestamp();

-- =============================================
-- 5. 查看已创建的策略（确认用）
-- =============================================
-- SELECT * FROM pg_policies WHERE tablename = 'user_data';
