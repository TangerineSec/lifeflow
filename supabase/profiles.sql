/**
 * =========================================================
 * LifeFlow → Supabase profiles 表
 * =========================================================
 *
 * 用途：扩展 auth.users，存储用户可编辑的个人资料。
 *
 * 字段说明：
 *   id          → 主键，引用 auth.users(id)，确保与 Supabase Auth 一一对应
 *   username    → 用户昵称/显示名（可自定义）
 *   avatar_url  → 头像 URL（预留，后续可接入 Gravatar 或上传）
 *   created_at  → 记录创建时间
 *   updated_at  → 记录更新时间
 *
 * 触发器：
 *   handle_new_user() → 用户注册时自动创建对应的 profiles 行
 *
 * RLS 策略：
 *   1. 用户只能查看自己的 profile
 *   2. 用户只能编辑自己的 profile
 *   3. 新用户注册时由触发器自动插入
 *
 * 使用 Supabase SQL Editor 执行下面的 SQL。
 */

-- =============================================
-- 1. 创建 profiles 表
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. 启用行级安全（RLS）
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RLS 策略
-- =============================================

-- 3a. 用户只能读取自己的 profile
CREATE POLICY "用户可以查看自己的资料"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 3b. 用户只能更新自己的 profile
CREATE POLICY "用户可以更新自己的资料"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3c. 禁止公开插入（由触发器自动插入）
CREATE POLICY "禁止公开插入"
  ON public.profiles
  FOR INSERT
  WITH CHECK (false);

-- 3d. 用户可以插入自己的 profile
-- （如果想让注册时填充额外数据，可以放开此策略）
-- CREATE POLICY "用户可以插入自己的资料"
--   ON public.profiles
--   FOR INSERT
--   WITH CHECK (auth.uid() = id);

-- =============================================
-- 4. 触发器：用户注册时自动创建 profile
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 在 auth.users 表上绑定触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. 查看已创建的策略（确认用）
-- =============================================
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
