import { defineStore } from 'pinia';
import api from '../api';
import { useToastStore } from './toast';
import i18n from '../locales';
import type { SystemLog, PagedResponse } from '../types/log';

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
    async fetchLogs(page = 0, size = 20, force = false) {
      const pageNum = page;
      const sizeNum = size;

      if (!force && this.currentLogs.length > 0 && this.currentPage === pageNum) {
        return;
      }

      await this.performFetchLogs(pageNum, sizeNum);
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
            page: pageNum,
            size: sizeNum,
            level: this.filters.level || undefined,
            source: this.filters.source || undefined,
            search: this.filters.search || undefined,
            sortBy: 'timestamp',
            direction: 'desc'
          };

          const [data] = await Promise.all([
            api.get<PagedResponse<SystemLog>>('/logs', {
              params
            }),
            new Promise(resolve => setTimeout(resolve, minDelay))
          ]);

          this.currentLogs = data.content;
          this.currentPage = data.number;
          this.pageSize = data.size;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
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
    }
  }
});
