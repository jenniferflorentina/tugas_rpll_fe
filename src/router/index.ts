import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

// layouts

import Admin from '@/components/layouts/full-layout/Layout.vue';
import Manager from '@/components/layouts/full-layout-manager/Layout.vue';

// views without layouts
import LandingPage from '@/views/Landing.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/admin',
    component: Admin,
    children: [
      {
        path: '/admin/dashboard',
        component: () =>
          import(/* webpackChunkName: "adminIndex" */ '@/views/Index.vue'),
      },
      {
        path: '/admin/product',
        component: () =>
          import(
            /* webpackChunkName: "adminProducts" */ '@/views/product/Index.vue'
          ),
      },
      {
        path: '/admin/order',
        component: () =>
          import(
            /* webpackChunkName: "adminOrders" */ '@/views/order/Index.vue'
          ),
      },
      {
        path: '/admin/setting',
        component: () =>
          import(
            /* webpackChunkName: "adminSettings" */ '@/views/setting/Index.vue'
          ),
      },
      {
        path: '/admin/member',
        component: () =>
          import(
            /* webpackChunkName: "adminMemberSetting" */ '@/views/setting/member/Index.vue'
          ),
      },
    ],
  },
  {
    path: '/manager',
    component: Manager,
    children: [
      {
        path: '/manager/dashboard',
        component: () =>
          import(/* webpackChunkName: "managerIndex" */ '@/views/Index.vue'),
      },
      {
        path: '/manager/order',
        component: () =>
          import(
            /* webpackChunkName: "managerOrders" */ '@/views/order/Index.vue'
          ),
      },
      {
        path: '/manager/transaction',
        component: () =>
          import(
            /* webpackChunkName: "managerTransactions" */ '@/views/manager/transaction/Index.vue'
          ),
      },
      {
        path: '/manager/product',
        component: () =>
          import(
            /* webpackChunkName: "managerProducts" */ '@/views/product/Index.vue'
          ),
      },
      {
        path: '/manager/finance',
        component: () =>
          import(
            /* webpackChunkName: "managerFinances" */ '@/views/manager/finance/Index.vue'
          ),
      },
      {
        path: '/manager/setting',
        component: () =>
          import(
            /* webpackChunkName: "managerSettings" */ '@/views/setting/Index.vue'
          ),
      },
      {
        path: '/manager/member',
        component: () =>
          import(
            /* webpackChunkName: "managerMemberSetting" */ '@/views/setting/member/Index.vue'
          ),
      },
    ],
  },
  {
    path: '/',
    component: LandingPage,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
