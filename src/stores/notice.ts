import { defineStore } from 'pinia';
import api from '../api';
import { useCacheStore } from './cache';

export interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  authorNickname: string;
  reactions: ReactionCount[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotices {
  content: Notice[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const useNoticeStore = defineStore('notice', {
  state: () => {
    const cached = localStorage.getItem('cached_notices');
    const pagination = localStorage.getItem('notices_pagination');
    return {
      notices: cached ? JSON.parse(cached) : [] as Notice[],
      loading: false,
      lastUpdated: localStorage.getItem('notices_last_updated') || null,
      totalPages: pagination ? JSON.parse(pagination).totalPages : 0,
      totalElements: pagination ? JSON.parse(pagination).totalElements : 0,
      currentPage: pagination ? JSON.parse(pagination).currentPage : 0,
      pageSize: pagination ? JSON.parse(pagination).pageSize : 10,
    };
  },
  getters: {
    getNoticeById: (state) => (id: number) => {
      return state.notices.find(n => n.id === id);
    },
    sortedNotices: (state) => {
      // The backend already sorts by pinned and createdAt, but we keep this for safety
      return [...state.notices].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  },
  actions: {
    async fetchNotices(page: any = 0, size: any = 10, force: boolean = false) {
      const pageNum = typeof page === 'number' ? page : 0;
      const sizeNum = typeof size === 'number' ? size : 10;
      
      const cacheStore = useCacheStore();

      // Check if not forcing and we have cached data for the same page
      if (!force && this.currentPage === pageNum && this.pageSize === sizeNum && this.lastUpdated) {
        try {
          const timestamps = await cacheStore.getTimestamps();
          const backendNoticeTime = new Date(timestamps.notices).getTime();
          const localNoticeTime = new Date(this.lastUpdated).getTime();

          if (backendNoticeTime <= localNoticeTime) {
            console.log('Notices cache is up to date');
            return;
          }
        } catch (error) {
          console.warn('Failed to fetch cache timestamps, falling back to full fetch', error);
        }
      }

      this.loading = true;
      try {
        const response = await api.get<PaginatedNotices>(`/notices?page=${pageNum}&size=${sizeNum}&t=${Date.now()}`);
        this.notices = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.number;
        this.pageSize = response.size;
        
        // Use the current time or the most recent notice's updatedAt as local timestamp
        this.lastUpdated = new Date().toISOString();
        
        // Cache data
        localStorage.setItem('cached_notices', JSON.stringify(this.notices));
        localStorage.setItem('notices_last_updated', this.lastUpdated);
        localStorage.setItem('notices_pagination', JSON.stringify({
            totalPages: this.totalPages,
            totalElements: this.totalElements,
            currentPage: this.currentPage,
            pageSize: this.pageSize
        }));
      } catch (error) {
        console.error('Failed to fetch notices', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchNoticeById(id: number) {
      try {
        const data = await api.get<Notice>(`/notices/${id}`);
        // Update the notice in the list if it exists
        const index = this.notices.findIndex(n => n.id === id);
        if (index !== -1) {
          this.notices[index] = data;
          localStorage.setItem('cached_notices', JSON.stringify(this.notices));
        }
        return data;
      } catch (error) {
        console.error(`Failed to fetch notice ${id}`, error);
        throw error;
      }
    },
    async toggleReaction(noticeId: number, emoji: string) {
      try {
        const data = await api.post<Notice>(`/notices/${noticeId}/reactions`, { emoji });
        const index = this.notices.findIndex(n => n.id === noticeId);
        if (index !== -1) {
          this.notices[index] = data;
          if (this.currentPage === 0) {
            localStorage.setItem('cached_notices', JSON.stringify(this.notices));
          }
        }
        return data;
      } catch (error) {
        console.error(`Failed to toggle reaction on notice ${noticeId}`, error);
        throw error;
      }
    },
    clearCache() {
      this.notices = [];
      this.lastUpdated = null;
      localStorage.removeItem('cached_notices');
      localStorage.removeItem('notices_last_updated');
    }
  },
});
