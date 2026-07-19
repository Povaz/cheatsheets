import { createRouter, createWebHashHistory } from 'vue-router'
import { findTopic } from './lib/content.js'
import Home from './pages/Home.vue'
import Topic from './pages/Topic.vue'
import Sheet from './pages/Sheet.vue'
import Recall from './pages/Recall.vue'

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
      if (topic.subtopics.length === 1) {
        return { path: `/${topic.slug}/${topic.subtopics[0].name}` }
      }
      if (topic.default) {
        return { path: `/${topic.slug}/${topic.default}` }
      }
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
      if (!sub) {
        return topic.default
          ? { path: `/${topic.slug}/${topic.default}` }
          : { path: `/${topic.slug}` }
      }
    },
  },
  { path: '/recall', component: Recall, name: 'recall' },
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
