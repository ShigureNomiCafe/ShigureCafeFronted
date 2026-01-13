import { defineStore } from 'pinia';
import api from '../api';

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
  timestamp: number;
}

export const useAdminAuditStore = defineStore('adminAudit', {
  state: () => {
    const rawLastUpdated = localStorage.getItem('admin_audits_last_updated');
    let lastUpdated: number | null = null;
    if (rawLastUpdated) {
        lastUpdated = isNaN(Number(rawLastUpdated)) 
            ? new Date(rawLastUpdated).getTime() 
            : Number(rawLastUpdated);
    }

    return {
      audits: JSON.parse(localStorage.getItem('admin_audits_cache') || '[]') as Audit[],
      pagination: JSON.parse(localStorage.getItem('admin_audits_pagination') || '{"currentPage":0,"pageSize":10,"totalElements":0,"totalPages":0,"isLast":true}'),
      loading: false,
      lastUpdated,
    };
  },
  actions: {
    async fetchAudits(page = 0, size = 10, force = false) {
      // Logic removed to use backend t parameter
      
      this.loading = true;
      try {
        const params: any = {
            page,
            size,
            sortBy: 'expiryDate',
            direction: 'desc'
        };
        if (!force && this.pagination.currentPage === page && this.pagination.pageSize === size && this.lastUpdated) {
             params.t = this.lastUpdated;
        }

        const data = await api.get<PagedResponse<Audit>>('/registrations', {
          params
        });
        
        this.audits = data.content;
        this.pagination = {
          currentPage: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          isLast: data.last
        };
        
        this.lastUpdated = data.timestamp;
        
        localStorage.setItem('admin_audits_cache', JSON.stringify(this.audits));
        localStorage.setItem('admin_audits_pagination', JSON.stringify(this.pagination));
        localStorage.setItem('admin_audits_last_updated', this.lastUpdated.toString());
      } catch (error: any) {
        if (error.response && error.response.status === 304) {
             console.log('Audits cache is up to date');
             return;
        }
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
