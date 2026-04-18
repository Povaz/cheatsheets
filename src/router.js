import { createRouter, createWebHashHistory } from 'vue-router'
import { findTopic } from './lib/content.js'
import Home from './pages/Home.vue'
import Topic from './pages/Topic.vue'
import Cheatsheet from './pages/Cheatsheet.vue'

const routes = [
  { path: '/', component: Home, name: 'home' },
  {
    path: '/:topic',
    component: Topic,
    name: 'topic',
    props: true,
    beforeEnter(to) {
      const topic = findTopic(to.params.topic)
      if (!topic) return '/'
      if (!topic.isFlat && topic.default) {
        return { path: `/${topic.slug}/${topic.default}` }
      }
    },
  },
  {
    path: '/:topic/:variant',
    component: Cheatsheet,
    name: 'cheatsheet',
    props: true,
    beforeEnter(to) {
      const topic = findTopic(to.params.topic)
      if (!topic) return '/'
      const v = topic.variants.find((x) => x.variant === to.params.variant)
      if (!v) {
        return topic.default
          ? { path: `/${topic.slug}/${topic.default}` }
          : { path: `/${topic.slug}` }
      }
    },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
