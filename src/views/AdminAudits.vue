<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    
    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out]">
            注册审核
          </h1>
          <div class="flex items-center space-x-4 animate-[slide-up_0.5s_ease-out_0.1s_both]">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search class="h-4 w-4 text-gray-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索审核码/用户名..."
                class="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
              />
            </div>
            <button 
              @click="fetchAudits" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RotateCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
              刷新列表
            </button>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <!-- Loading State -->
              <div v-if="loading && audits.length === 0" class="p-12 flex justify-center items-center text-gray-400">
                <Loader2 class="h-8 w-8 animate-spin" />
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredAudits.length === 0" class="p-12 text-center text-gray-500 flex flex-col items-center">
                <ClipboardList class="h-12 w-12 text-gray-300 mb-3" />
                <p>{{ searchQuery ? '未找到匹配的记录' : '暂无待审核用户' }}</p>
              </div>

              <!-- Audits Table -->
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50/50">
                    <tr>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电子邮箱</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">审核码</th>
                      <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="audit in filteredAudits" :key="audit.auditCode" class="hover:bg-gray-50/80 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mr-3">
                            {{ (audit.nickname || audit.username).substring(0, 2).toUpperCase() }}
                          </div>
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ audit.nickname || audit.username }}</div>
                            <div class="text-xs text-gray-400">@{{ audit.username }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ audit.email }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                           {{ audit.auditCode }}
                         </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full"
                          :class="{
                            'bg-green-100 text-green-800': audit.status === 'ACTIVE',
                            'bg-yellow-100 text-yellow-800': audit.status === 'PENDING',
                            'bg-red-100 text-red-800': audit.status === 'BANNED',
                            'bg-gray-100 text-gray-800': audit.isExpired
                          }"
                        >
                          {{ audit.isExpired ? '已过期' : formatStatus(audit.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          v-if="!audit.isExpired && audit.status !== 'ACTIVE'"
                          @click="approveAudit(audit.auditCode)" 
                          class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <CheckCircle class="h-3.5 w-3.5 mr-1" />
                          通过
                        </button>
                        <span v-else class="text-gray-400 text-xs italic">
                          无需操作
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import NavBar from '../components/NavBar.vue';
import { useToastStore } from '../stores/toast';
import { RotateCw, Loader2, ClipboardList, CheckCircle, Search } from 'lucide-vue-next';

interface Audit {
  username: string;
  nickname: string;
  email: string;
  status: string;
  auditCode: string;
  isExpired: boolean;
}

const audits = ref<Audit[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const toast = useToastStore();

const filteredAudits = computed(() => {
  if (!searchQuery.value) return audits.value;
  const q = searchQuery.value.toLowerCase();
  return audits.value.filter(audit => 
    audit.auditCode.toLowerCase().includes(q) ||
    audit.username.toLowerCase().includes(q) ||
    audit.nickname?.toLowerCase().includes(q) ||
    audit.email.toLowerCase().includes(q)
  );
});

const fetchAudits = async () => {
  loading.value = true;
  try {
    const codesResponse = await api.get('/registrations');
    const codes: string[] = codesResponse.data;
    
    const detailsPromises = codes.map(code => api.get(`/registrations/${code}`));
    const detailsResponses = await Promise.all(detailsPromises);
    
    audits.value = detailsResponses.map(res => res.data);
  } catch (error) {
    toast.error('获取审核列表失败');
  } finally {
    loading.value = false;
  }
};

const approveAudit = async (auditCode: string) => {
  if (!confirm('确定要通过该用户的审核吗？')) return;
  
  try {
    await api.patch(`/registrations/${auditCode}`);
    toast.success('审核已通过');
    await fetchAudits();
  } catch (error) {
    toast.error('操作失败');
  }
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: '正常',
    PENDING: '待审核',
    BANNED: '封禁'
  };
  return map[status] || status;
};

onMounted(() => {
  fetchAudits();
});
</script>
