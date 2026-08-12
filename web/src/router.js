import { createRouter, createWebHashHistory } from 'vue-router'
import { findTopic } from './lib/content.js'
import Home from './pages/Home.vue'
import Sheet from './pages/Sheet.vue'
import Recall from './pages/Recall.vue'

const routes = [
  { path: '/', component: Home, name: 'home' },
  {
    path: '/:topic',
    name: 'topic',
    beforeEnter(to) {
      const topic = findTopic(to.params.topic)
      if (!topic) return '/'
      return { path: `/${topic.slug}/${topic.default}` }
    },
  },
  {
    path: '/:topic/:subtopic',
    component: Sheet,
    name: 'sheet',
    props: true,
    beforeEnter(to) {
      const topic = findTopic(to.params.topic)
      if (!topic) return '/'
      const sub = topic.subtopics.find((s) => s.name === to.params.subtopic)
      if (!sub) return { path: `/${topic.slug}/${topic.default}` }
    },
  },
  { path: '/recall', component: Recall, name: 'recall' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
