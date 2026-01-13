import { defineStore } from 'pinia';
import api from '../api';
import { useCacheStore } from './cache';

interface Audit {
  username: string;
  nickname: string;
  email: string;
  status: string;
  auditCode: string;
  isExpired: boolean;
}

interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const useAdminAuditStore = defineStore('adminAudit', {
  state: () => ({
    audits: JSON.parse(localStorage.getItem('admin_audits_cache') || '[]') as Audit[],
    pagination: JSON.parse(localStorage.getItem('admin_audits_pagination') || '{"currentPage":0,"pageSize":10,"totalElements":0,"totalPages":0,"isLast":true}'),
    loading: false,
    lastUpdated: localStorage.getItem('admin_audits_last_updated') || null,
  }),
  actions: {
    async fetchAudits(page = 0, size = 10, force = false) {
      const cacheStore = useCacheStore();
      // Check timestamp if not forcing and we have cached data for the same page
      if (!force && this.pagination.currentPage === page && this.pagination.pageSize === size && this.lastUpdated) {
        try {
          const timestamps = await cacheStore.getTimestamps();
          const backendTime = new Date(timestamps.audits).getTime();
          const localTime = new Date(this.lastUpdated).getTime();

          if (backendTime <= localTime) {
            console.log('Audits cache is up to date');
            return;
          }
        } catch (error) {
          console.warn('Failed to fetch cache timestamps, falling back to full fetch', error);
        }
      }

      this.loading = true;
      try {
        const data = await api.get<PagedResponse<Audit>>('/registrations', {
          params: {
            page,
            size,
            sortBy: 'expiryDate',
            direction: 'desc'
          }
        });
        
        this.audits = data.content;
        this.pagination = {
          currentPage: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          isLast: data.last
        };
        
        this.lastUpdated = new Date().toISOString();
        
        localStorage.setItem('admin_audits_cache', JSON.stringify(this.audits));
        localStorage.setItem('admin_audits_pagination', JSON.stringify(this.pagination));
        localStorage.setItem('admin_audits_last_updated', this.lastUpdated);
      } catch (error) {
        console.error('Failed to fetch audits', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    clearCache() {
      this.audits = [];
      this.lastUpdated = null;
      localStorage.removeItem('admin_audits_cache');
      localStorage.removeItem('admin_audits_pagination');
      localStorage.removeItem('admin_audits_last_updated');
    }
  }
});
