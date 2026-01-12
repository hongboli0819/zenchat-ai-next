/**
 * Supabase Client
 * 用于客户端组件
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/core/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// 客户端 Supabase（使用 Anon Key，受 RLS 限制）
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// 检查客户端配置是否有效
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// ============ Admin Client（使用 Service Role Key，绕过 RLS）============

// 检查 Admin 配置是否有效
export const isSupabaseAdminConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseServiceKey);
};

// Admin Supabase（使用 Service Role Key，绕过 RLS）
// 注意：仅在服务端使用，不要暴露给客户端
export const supabaseAdmin: SupabaseClient<Database> = isSupabaseAdminConfigured()
  ? createClient<Database>(supabaseUrl, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase; // 如果没有 Service Key，回退到普通客户端
