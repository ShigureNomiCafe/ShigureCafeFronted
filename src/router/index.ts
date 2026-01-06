import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import Dashboard from '../views/Dashboard.vue';
import Profile from '../views/Profile.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/', redirect: '/login' },
  ],
});

export default router;
