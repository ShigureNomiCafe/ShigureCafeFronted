<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <AdminPageHeader :title="t('admin-logs.title')" v-model="logStore.filters.search" :loading="logStore.loading"
        :search-placeholder="t('admin-logs.filters.search-placeholder')" @refresh="fetchLogs(0, true)"
        class="relative z-20">
        <template #extra>
          <BaseSelect v-model="logStore.filters.level" :options="levelOptions" class="min-w-[150px] animate-slide-up animate-delay-50"
            @change="handleFilterChange" />
          <BaseSelect v-model="logStore.filters.source" :options="sourceOptions" class="min-w-[150px] animate-slide-up animate-delay-50"
            @change="handleFilterChange" />
        </template>
      </AdminPageHeader>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mt-8">
          <BaseCard body-class="p-0 overflow-hidden" class="animate-slide-up animate-delay-100">
            <transition name="fade-slide" mode="out-in">
              <div
                :key="logStore.logs.length > 0 ? `logs-${logStore.currentPage}-${logStore.filters.level}-${logStore.filters.source}-${logStore.filters.search}-${logStore.fetchCount}` : (logStore.loading ? 'loading' : 'empty')"
                class="min-h-[400px] flex flex-col relative">
                <!-- Loading overlay -->
                <div v-if="logStore.loading && logStore.logs.length === 0"
                  class="flex-1 flex justify-center items-center text-gray-400">
                  <Loader2 class="h-8 w-8 animate-spin" />
                </div>

                <!-- Empty State -->
                <div v-else-if="logStore.logs.length === 0"
                  class="flex-1 text-center text-gray-500 flex flex-col items-center justify-center py-20">
                  <ClipboardList class="h-12 w-12 text-gray-300 mb-3" />
                  <p>{{ t('admin-logs.no-logs') }}</p>
                </div>

                <!-- Logs Table -->
                <div v-else class="flex-1 flex flex-col">
                  <!-- Loading overlay for refresh -->
                  <div v-if="logStore.loading"
                    class="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                    <Loader2 class="h-8 w-8 animate-spin text-indigo-500" />
                  </div>

                  <CustomScrollContainer class="flex-1">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                            {{ t('admin-logs.table.time') }}
                          </th>
                          <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                            {{ t('admin-logs.table.level') }}
                          </th>
                          <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            {{ t('admin-logs.table.source') }}
                          </th>
                          <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {{ t('admin-logs.table.content') }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-100 font-mono text-sm">
                        <tr v-for="log in logStore.logs" :key="log.id" class="hover:bg-gray-50/80 transition-colors">
                          <td class="px-6 py-3 whitespace-nowrap text-gray-500">
                            {{ formatTimestamp(log.timestamp) }}
                          </td>
                          <td class="px-6 py-3 whitespace-nowrap">
                            <BaseBadge :variant="getVariant(log.level)">
                              {{ log.level }}
                            </BaseBadge>
                          </td>
                          <td class="px-6 py-3 whitespace-nowrap">
                            <code
                              class="px-2 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono border border-gray-200/50">
                              {{ log.source }}
                            </code>
                          </td>
                          <td class="px-6 py-3 text-gray-800 break-all whitespace-pre-wrap">
                            {{ log.content }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CustomScrollContainer>
                </div>
              </div>
            </transition>

            <!-- Pagination -->
            <Pagination v-if="logStore.logs.length > 0"
              :current-page="logStore.pagination.currentPage"
              :total-pages="logStore.pagination.totalPages"
              :total-elements="logStore.pagination.totalElements"
              :page-size="logStore.pagination.pageSize" @page-change="handlePageChange"
              class="bg-gray-50/50 border-t border-gray-100" />
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import Pagination from '../components/Pagination.vue';
import CustomScrollContainer from '../components/CustomScrollContainer.vue';
import BaseBadge from '../components/BaseBadge.vue';
import BaseSelect from '../components/BaseSelect.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import { useSystemLogStore } from '../stores/systemLog';
import { ClipboardList, Search, RefreshCw, Loader2 } from 'lucide-vue-next';
import { formatDateTimePrecise } from '../utils/formatters';

const debounce = (fn: Function, delay: number) => {
  let timeoutId: number | null = null;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const { t } = useI18n();
const logStore = useSystemLogStore();

const levelOptions = computed(() => [
  { label: t('admin-logs.filters.all-levels'), value: '' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARN', value: 'WARN' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'DEBUG', value: 'DEBUG' }
]);

const sourceOptions = computed(() => [
  { label: t('admin-logs.filters.all-sources'), value: '' },
  { label: 'BACKEND', value: 'BACKEND' },
  { label: 'BOT', value: 'BOT' },
  { label: 'PLUGIN', value: 'PLUGIN' },
  { label: 'WEB', value: 'WEB' },
  { label: 'EXTERNAL', value: 'EXTERNAL' }
]);

const formatTimestamp = (ts: number) => {
  return formatDateTimePrecise(ts);
};

const getVariant = (level: string) => {
  switch (level.toUpperCase()) {
    case 'ERROR': return 'danger';
    case 'WARN': return 'warning';
    case 'INFO': return 'info';
    case 'DEBUG': return 'neutral';
    default: return 'neutral';
  }
};

const fetchLogs = async (page?: number, force: boolean = false) => {
  const targetPage = typeof page === 'number' ? page : logStore.pagination.currentPage;
  await logStore.fetchLogs(targetPage, logStore.pagination.pageSize, force);
};

const handlePageChange = (page: number) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchLogs(page);
};

const handleFilterChange = () => {
  fetchLogs(0, true);
};

const debouncedFetch = debounce(() => {
  fetchLogs(0, true);
}, 500);

watch(() => logStore.filters.search, () => {
  debouncedFetch();
});

onMounted(() => {
  fetchLogs(0);
});
</script>
