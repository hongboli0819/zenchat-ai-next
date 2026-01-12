/**
 * Query Client 配置
 * 
 * 集中管理 TanStack Query 的配置：
 * - 缓存策略
 * - 重试策略
 * - 查询默认配置
 * - 持久化缓存（可选）
 */

import { QueryClient } from "@tanstack/react-query";

// ============ 缓存时间配置 ============

export const CACHE_TIMES = {
  POSTS: {
    staleTime: 1000 * 60 * 5, // 5 分钟
    gcTime: 1000 * 60 * 30,   // 30 分钟
  },
  ACCOUNTS: {
    staleTime: 1000 * 60 * 10, // 10 分钟
    gcTime: 1000 * 60 * 60,    // 1 小时
  },
  TASKS: {
    staleTime: 1000 * 30,      // 30 秒（任务状态变化快）
    gcTime: 1000 * 60 * 10,    // 10 分钟
  },
  STATS: {
    staleTime: 1000 * 60 * 5,  // 5 分钟
    gcTime: 1000 * 60 * 30,    // 30 分钟
  },
  IMAGES: {
    staleTime: 1000 * 60 * 30, // 30 分钟（图片不常变化）
    gcTime: 1000 * 60 * 60,    // 1 小时
  },
} as const;

// ============ Query Keys 工厂 ============

export const queryKeys = {
  // 帖子相关
  posts: {
    all: ["posts"] as const,
    list: (filters?: { withImages?: boolean; search?: string; withFirstImage?: boolean }) =>
      ["posts", "list", filters] as const,
    detail: (id: string) => ["posts", "detail", id] as const,
    images: (postId: string) => ["posts", "images", postId] as const,
  },
  // 账号相关
  accounts: {
    all: ["accounts"] as const,
    list: () => ["accounts", "list"] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
    stats: (id: string) => ["accounts", "stats", id] as const,
    posts: (id: string) => ["accounts", "posts", id] as const,
  },
  // 任务相关
  tasks: {
    all: ["tasks"] as const,
    list: () => ["tasks", "list"] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    images: (taskId: string) => ["tasks", "images", taskId] as const,
  },
  // 统计相关
  stats: {
    overview: () => ["stats", "overview"] as const,
    dashboard: (filters?: { timeRange?: string }) => ["stats", "dashboard", filters] as const,
  },
  // 图片相关
  images: {
    byPost: (postId: string) => ["images", "post", postId] as const,
    byTask: (taskId: string) => ["images", "task", taskId] as const,
  },
} as const;

// 创建 QueryClient 工厂函数
export function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 缓存 5 分钟
        staleTime: 1000 * 60 * 5,
        // 后台刷新缓存（5分钟后）
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // 失败重试
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 0,
      },
    },
  });

  // 持久化缓存（仅在客户端）
  if (typeof window !== 'undefined') {
    try {
      const cachedData = localStorage.getItem("react-query-cache");
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        queryClient.setQueryData(["cache"], parsed);
        console.log("[QueryCache] 恢复缓存成功");
      }
    } catch (e) {
      console.warn("[QueryCache] 恢复缓存失败:", e);
    }

    // 监听窗口关闭，保存缓存
    window.addEventListener("beforeunload", () => {
      try {
        const cache = queryClient.getQueryCache().getAll();
        localStorage.setItem("react-query-cache", JSON.stringify(cache));
      } catch (e) {
        console.warn("[QueryCache] 保存缓存失败:", e);
      }
    });
  }

  return queryClient;
}
