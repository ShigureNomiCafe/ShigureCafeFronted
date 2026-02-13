import { defineStore } from 'pinia';
import api from '../api';
import { useToastStore } from './toast';
import i18n from '../locales';
import type { SystemLog } from '../types/log';

const { t } = i18n.global;

export const useSystemLogStore = defineStore('systemLog', {
  state: () => {
    return {
      currentLogs: [] as SystemLog[],
      loading: false,
      currentPage: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      filters: {
        level: '',
        source: '',
        search: ''
      },
      fetchCount: 0,
      fetchPromises: {} as Record<string, Promise<void>>,
      lastId: 0 as number,
      firstId: 0 as number,
      isPolling: false,
      loadingOlder: false,
      hasMoreOlder: true,
    };
  },
  getters: {
    logs: (state) => state.currentLogs,
    pagination: (state) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      totalElements: state.totalElements,
      totalPages: state.totalPages,
    })
  },
  actions: {
    async fetchLogs(page = 0, size = 50, force = false) {
      const pageNum = page;
      const sizeNum = size;

      if (!force && this.currentLogs.length > 0 && this.currentPage === pageNum) {
        return;
      }

      await this.performFetchLogs(pageNum, sizeNum);
    },
    async fetchOlderLogs() {
      if (this.loading || this.loadingOlder || !this.hasMoreOlder || !this.firstId) return;

      const toastStore = useToastStore();
      this.loadingOlder = true;

      try {
        const params: any = {
          beforeId: this.firstId,
          limit: this.pageSize,
          level: this.filters.level || undefined,
          source: this.filters.source || undefined,
          search: this.filters.search || undefined
        };

        const data = await api.get<SystemLog[]>('/logs/older', { params });
        
        if (data.length > 0) {
          // data is returned in desc order by backend (latest first among older logs)
          // We need to reverse it to maintain the chronological order of our list
          const olderLogs = [...data].reverse();
          this.currentLogs = [...olderLogs, ...this.currentLogs];
          this.firstId = Math.min(...this.currentLogs.map(l => l.id));
          
          if (data.length < this.pageSize) {
            this.hasMoreOlder = false;
          }
        } else {
          this.hasMoreOlder = false;
        }
      } catch (error: any) {
        toastStore.error(t('admin-logs.messages.fetch-failed'), error.message);
      } finally {
        this.loadingOlder = false;
      }
    },
    async fetchLatestLogs() {
      if (this.loading || !this.lastId) return;

      try {
        const params: any = {
          afterId: this.lastId,
          level: this.filters.level || undefined,
          source: this.filters.source || undefined,
          search: this.filters.search || undefined
        };

        const data = await api.get<SystemLog[]>('/logs/latest', { params });
        
        if (data.length > 0) {
          // Append new logs and maintain a maximum number of logs to prevent memory issues
          const newLogs = [...this.currentLogs, ...data];
          const maxLogs = 1000;
          if (newLogs.length > maxLogs) {
            this.currentLogs = newLogs.slice(newLogs.length - maxLogs);
          } else {
            this.currentLogs = newLogs;
          }
          
          this.lastId = Math.max(...this.currentLogs.map(l => l.id));
          this.firstId = Math.min(...this.currentLogs.map(l => l.id));
          this.fetchCount++;
        }
      } catch (error: any) {
        console.error('Failed to fetch latest logs:', error);
      }
    },
    async performFetchLogs(pageNum: number, sizeNum: number) {
      const fetchKey = `${pageNum}-${this.filters.level}-${this.filters.source}-${this.filters.search}`;
      if (this.fetchPromises[fetchKey]) {
        return this.fetchPromises[fetchKey];
      }

      const toastStore = useToastStore();
      this.loading = true;

      const minDelay = 500;

      this.fetchPromises[fetchKey] = (async () => {
        try {
          const params: any = {
            limit: sizeNum,
            level: this.filters.level || undefined,
            source: this.filters.source || undefined,
            search: this.filters.search || undefined
          };

          const [data] = await Promise.all([
            api.get<SystemLog[]>('/logs/latest', {
              params
            }),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);

          // Fresh fetch or filter change
          this.currentLogs = data;
          this.hasMoreOlder = data.length === sizeNum;
          
          this.currentPage = 0;
          this.pageSize = sizeNum;
          
          if (this.currentLogs.length > 0) {
            this.lastId = Math.max(...this.currentLogs.map(l => l.id));
            this.firstId = Math.min(...this.currentLogs.map(l => l.id));
          } else {
            this.lastId = 0;
            this.firstId = 0;
          }
          
          this.fetchCount++;

        } catch (error: any) {
          toastStore.error(t('admin-logs.messages.fetch-failed'), error.message);
        } finally {
          this.loading = false;
          delete this.fetchPromises[fetchKey];
        }
      })();

      return this.fetchPromises[fetchKey];
    },
    setFilters(filters: { level?: string, source?: string, search?: string }) {
      this.filters = { ...this.filters, ...filters };
      this.currentPage = 0;
    },
    clearCache() {
      this.currentLogs = [];
      this.currentPage = 0;
      this.totalElements = 0;
      this.totalPages = 0;
      this.firstId = 0;
      this.lastId = 0;
      this.hasMoreOlder = true;
    }
  }
});
