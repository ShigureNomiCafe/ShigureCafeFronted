import { defineStore } from 'pinia';
import api from '../api';

export interface SystemUpdates {
  noticeLastUpdated: number;
  userLastUpdated: number;
  auditLastUpdated: number;
}

export const useSystemStore = defineStore('system', {
  state: () => ({
    updates: {
      noticeLastUpdated: 0,
      userLastUpdated: 0,
      auditLastUpdated: 0,
    } as SystemUpdates,
    loading: false,
    lastFetched: 0,
  }),
  actions: {
    async fetchUpdates() {
      if (Date.now() - this.lastFetched < 1000) {
        return this.updates;
      }
      
      this.loading = true;
      try {
        const data = await api.get<SystemUpdates>('/system/updates');
        this.updates = data;
        this.lastFetched = Date.now();
        return data;
      } catch (error) {
        // Silent background fail
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});