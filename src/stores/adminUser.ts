import { defineStore } from 'pinia';
import api from '../api';

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
  timestamp: number;
}

export const useAdminUserStore = defineStore('adminUser', {
  state: () => {
    const rawLastUpdated = localStorage.getItem('admin_users_last_updated');
    let lastUpdated: number | null = null;
    if (rawLastUpdated) {
        lastUpdated = isNaN(Number(rawLastUpdated)) 
            ? new Date(rawLastUpdated).getTime() 
            : Number(rawLastUpdated);
    }
    
    return {
      users: JSON.parse(localStorage.getItem('admin_users_cache') || '[]') as User[],
      pagination: JSON.parse(localStorage.getItem('admin_users_pagination') || '{"currentPage":0,"pageSize":10,"totalElements":0,"totalPages":0,"isLast":true}'),
      loading: false,
      lastUpdated,
    };
  },
  actions: {
    async fetchUsers(page = 0, size = 10, force = false) {
      this.loading = true;
      try {
        const params: any = { page, size };
        if (!force && this.pagination.currentPage === page && this.pagination.pageSize === size && this.lastUpdated) {
            params.t = this.lastUpdated;
        }

        const data = await api.get<PagedResponse<User>>('/users', {
          params
        });
        
        this.users = data.content;
        this.pagination = {
          currentPage: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          isLast: data.last
        };
        
        this.lastUpdated = data.timestamp;
        
        // Always cache the currently viewed page
        localStorage.setItem('admin_users_cache', JSON.stringify(this.users));
        localStorage.setItem('admin_users_pagination', JSON.stringify(this.pagination));
        localStorage.setItem('admin_users_last_updated', this.lastUpdated.toString());
      } catch (error: any) {
        if (error.response && error.response.status === 304) {
             console.log('Users cache is up to date');
             return;
        }
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
