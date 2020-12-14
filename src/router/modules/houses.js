/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const housesRouter = {
  path: '/houses',
  component: Layout,
  redirect: 'noRedirect',
  children: [
    {
      path: 'list',
      component: () => import('@/views/houses/index'),
      name: 'Houses',
      meta: {
        title: 'Danh sách nhà',
        icon: 'house',
        noCache: true
      }
    }
  ]
}

export default housesRouter
