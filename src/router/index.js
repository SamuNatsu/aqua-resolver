/* Router */
import { createRouter, createWebHistory } from 'vue-router'

// Router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: ()=>import('../views/Index.vue')
    },
    {
      path: '/rank',
      component: ()=>import('../views/Rank.vue')
    }
  ]
})

// Export
export default router
