import { defineStore } from 'pinia';
import api from '../api';

export const useCacheStore = defineStore('cache', {
  state: () => ({
    timestamps: {} as Record<string, string>,
    timestampPromise: null as Promise<Record<string, string>> | null,
    lastFetch: 0,
  }),
  actions: {
    async getTimestamps() {
      const now = Date.now();
      // Cache the timestamp response for 2 seconds to deduplicate rapid successive calls
      if (this.timestampPromise && (now - this.lastFetch < 2000)) {
        return this.timestampPromise;
      }

      this.lastFetch = now;
      this.timestampPromise = (async () => {
        try {
          const data = await api.get<Record<string, string>>('/cache/timestamps');
          this.timestamps = data;
          return data;
        } catch (error) {
          this.timestampPromise = null;
          throw error;
        }
      })();

      return this.timestampPromise;
    }
  }
});
