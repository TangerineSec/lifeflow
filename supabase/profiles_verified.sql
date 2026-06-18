/**
 * =========================================================
 * LifeFlow → profiles 表扩展：认证状态
 * =========================================================
 *
 * 为 profiles 表新增字段，并创建自动更新认证状态的触发器。
 *
 * 认证标准：full_name、phone、email 三个字段均不为空 → is_verified_profile = true
 *
 * 在 Supabase SQL Editor 中分段执行。
 */

-- =============================================
-- 1. 新增字段
-- =============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name          TEXT,
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS email              TEXT,
  ADD COLUMN IF NOT EXISTS is_verified_profile BOOLEAN NOT NULL DEFAULT false;

-- 为 phone 创建唯一索引（可选），方便后续扩展
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);

-- =============================================
-- 2. 更新 RLS 策略
-- =============================================

-- 原有策略只允许用户查看自己的 profile。
-- 更新为：所有已认证用户可查看他人的公开信息（用于展示认证状态），
-- 但只能编辑自己的资料。
--
-- 注意：如果希望保留严格的隐私控制，可以不改 SELECT 策略，
-- 而是创建一个数据库函数只暴露 is_verified_profile。

-- 先删除旧的 SELECT 策略
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON public.profiles;

-- 新策略：所有已登录用户可读取所有 profiles（公开资料 + 认证状态）
CREATE POLICY "所有用户可查看公开资料"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 更新策略保持不变（只允许用户修改自己的数据）
-- 已有的 "用户可以更新自己的资料" POLICY 已经正确
-- USING (auth.uid() = id) WITH CHECK (auth.uid() = id)

-- 可选：添加 DELETE 策略（目前没有删除需求）
-- CREATE POLICY "用户可以删除自己的资料"
--   ON public.profiles
--   FOR DELETE
--   USING (auth.uid() = id);

-- =============================================
-- 3. 触发器：自动更新认证状态
-- =============================================

-- 如果用户更新了资料，自动检查 full_name、phone、email 是否全部非空，
-- 并相应设置 is_verified_profile。

CREATE OR REPLACE FUNCTION public.update_profile_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 检查三个核心字段是否全部非空
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' AND
     NEW.phone IS NOT NULL AND NEW.phone != '' AND
     NEW.email IS NOT NULL AND NEW.email != '' THEN
    NEW.is_verified_profile := true;
  ELSE
    NEW.is_verified_profile := false;
  END IF;

  -- 自动更新 updated_at
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

-- 绑定到 profiles 表的 BEFORE UPDATE 触发器
DROP TRIGGER IF EXISTS trigger_profile_verification ON public.profiles;
CREATE TRIGGER trigger_profile_verification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_verification();

-- =============================================
-- 4. 验证（确认用）
-- =============================================

-- 查看所有策略
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 查看 profiles 表结构
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- ORDER BY ordinal_position;
