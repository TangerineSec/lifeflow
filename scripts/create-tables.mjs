/**
 * 使用 Supabase Management API 执行建表 SQL
 * 需要 Supabase 个人访问令牌（Personal Access Token）
 *
 * 使用方式：
 *   SUPABASE_TOKEN=你的个人令牌 node scripts/create-tables.mjs
 *
 * 获取令牌：Supabase Dashboard → Account → Access Tokens → New Token
 */

const projectRef = 'wuphjjyudhekuhhwxncj';
const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const sql = `
CREATE TABLE IF NOT EXISTS public.user_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data (user_id);

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可读取自己的数据"
  ON public.user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可插入自己的数据"
  ON public.user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的数据"
  ON public.user_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_user_data_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
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
`;

async function main() {
  const token = process.env.SUPABASE_TOKEN;
  if (!token) {
    console.error('❌ 请设置 SUPABASE_TOKEN 环境变量');
    console.error('   获取方式: Supabase Dashboard → Account → Access Tokens → New Token');
    process.exit(1);
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log('✅ user_data 表创建成功！');
  } else {
    const err = await res.text();
    console.error('❌ 创建失败:', err);
  }
}

main();
