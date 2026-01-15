import { defineStore } from 'pinia';
import api from '../api';

export interface SystemUpdates {
  noticeLastUpdated: number;
  userLastUpdated: number;
  auditLastUpdated: number;
}

export interface ReactionType {
  name: string;
  emoji: string;
}

export const useSystemStore = defineStore('system', {
  state: () => ({
    updates: {
      noticeLastUpdated: 0,
      userLastUpdated: 0,
      auditLastUpdated: 0,
    } as SystemUpdates,
    reactionTypes: [] as ReactionType[],
    reactionTypesLoaded: false,
    loading: false,
    lastFetched: 0,
    fetchPromise: null as Promise<SystemUpdates> | null,
  }),
  getters: {
    reactionMap: (state) => {
      const map: Record<string, string> = {};
      state.reactionTypes.forEach(t => {
        map[t.name] = t.emoji;
      });
      return map;
    }
  },
  actions: {
    async fetchReactionTypes() {
      if (this.reactionTypesLoaded) return this.reactionTypes;
      
      try {
        const data = await api.get<ReactionType[]>('/system/reaction-types');
        this.reactionTypes = data;
        this.reactionTypesLoaded = true;
        return data;
      } catch (error) {
        console.error('Failed to fetch reaction types', error);
        return [];
      }
    },

    async fetchUpdates() {
      if (this.fetchPromise) {
        return this.fetchPromise;
      }

      if (Date.now() - this.lastFetched < 1000) {
        return this.updates;
      }
      
      this.loading = true;
      this.fetchPromise = api.get<SystemUpdates>('/system/updates').then(data => {
        this.updates = data;
        this.lastFetched = Date.now();
        this.fetchPromise = null;
        return data;
      }).catch(error => {
        this.fetchPromise = null;
        throw error;
      }).finally(() => {
        this.loading = false;
      });

      return this.fetchPromise;
    }
  }
});