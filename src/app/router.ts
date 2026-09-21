import { createRouter, createWebHistory } from 'vue-router'
import { scrollBehavior } from './scrollBehavior'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior,
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/create', name: 'builder', component: () => import('@/views/BuilderView.vue') },
    { path: '/my/:profileId', name: 'personal', component: () => import('@/views/PersonalAppView.vue') },
    { path: '/scripture', name: 'scripture', component: () => import('@/apps/scripture/ScriptureView.vue') },
    { path: '/scripture/search', name: 'scripture-search', component: () => import('@/apps/scripture/SearchView.vue') },
    { path: '/scripture/:translation', name: 'scripture-books', component: () => import('@/apps/scripture/BooksView.vue') },
    { path: '/scripture/:translation/:book/:chapter', name: 'scripture-chapter', component: () => import('@/apps/scripture/ReaderView.vue') },
    { path: '/prayer', name: 'prayer', component: () => import('@/apps/prayer/PrayerView.vue') },
    { path: '/calendar', name: 'calendar', component: () => import('@/apps/calendar/CalendarView.vue') },
    { path: '/calendar/:date', name: 'calendar-date', component: () => import('@/apps/calendar/CalendarView.vue') },
    { path: '/icons', name: 'icons', component: () => import('@/apps/icons/IconsView.vue') },
    { path: '/slavonic', name: 'slavonic', component: () => import('@/apps/slavonic/SlavonicView.vue') },
    { path: '/slavonic/recognize', name: 'slavonic-recognize', component: () => import('@/apps/slavonic/RecognizerView.vue') },
    { path: '/slavonic/learn', redirect: '/slavonic' },
    { path: '/resources/faith', component: () => import('@/apps/resources/ResourceListView.vue'), props: { kind: 'faith' } },
    { path: '/resources/recipes', component: () => import('@/apps/resources/ResourceListView.vue'), props: { kind: 'recipes' } },
    { path: '/resources/quizzes', component: () => import('@/apps/resources/ResourceListView.vue'), props: { kind: 'quizzes' } },
    { path: '/resources/tours', component: () => import('@/apps/resources/ResourceListView.vue'), props: { kind: 'tours' } },
    { path: '/resources/links', component: () => import('@/apps/resources/ResourceListView.vue'), props: { kind: 'links' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})
