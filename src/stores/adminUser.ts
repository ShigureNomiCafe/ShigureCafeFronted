import { defineStore } from 'pinia';
import api from '../api';
import { useCacheStore } from './cache';

interface User {
  username: string;
  nickname: string;
  email: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  email2faEnabled: boolean;
  totpEnabled: boolean;
  minecraftUuid?: string;
  minecraftUsername?: string;
}

interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const useAdminUserStore = defineStore('adminUser', {
  state: () => ({
    users: JSON.parse(localStorage.getItem('admin_users_cache') || '[]') as User[],
    pagination: JSON.parse(localStorage.getItem('admin_users_pagination') || '{"currentPage":0,"pageSize":10,"totalElements":0,"totalPages":0,"isLast":true}'),
    loading: false,
    lastUpdated: localStorage.getItem('admin_users_last_updated') || null,
  }),
  actions: {
    async fetchUsers(page = 0, size = 10, force = false) {
      const cacheStore = useCacheStore();
      // Check timestamp if not forcing and we have cached data for the same page
      if (!force && this.pagination.currentPage === page && this.pagination.pageSize === size && this.lastUpdated) {
        try {
          const timestamps = await cacheStore.getTimestamps();
          const backendTime = new Date(timestamps.users).getTime();
          const localTime = new Date(this.lastUpdated).getTime();

          if (backendTime <= localTime) {
            console.log('Users cache is up to date');
            return;
          }
        } catch (error) {
          console.warn('Failed to fetch cache timestamps, falling back to full fetch', error);
        }
      }

      this.loading = true;
      try {
        const data = await api.get<PagedResponse<User>>('/users', {
          params: { page, size }
        });
        
        this.users = data.content;
        this.pagination = {
          currentPage: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          isLast: data.last
        };
        
        this.lastUpdated = new Date().toISOString();
        
        // Always cache the currently viewed page
        localStorage.setItem('admin_users_cache', JSON.stringify(this.users));
        localStorage.setItem('admin_users_pagination', JSON.stringify(this.pagination));
        localStorage.setItem('admin_users_last_updated', this.lastUpdated);
      } catch (error) {
        console.error('Failed to fetch users', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    clearCache() {
      this.users = [];
      this.lastUpdated = null;
      localStorage.removeItem('admin_users_cache');
      localStorage.removeItem('admin_users_pagination');
      localStorage.removeItem('admin_users_last_updated');
    }
  }
});
