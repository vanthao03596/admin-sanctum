/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const usersRouter = {
  path: '/users',
  component: Layout,
  redirect: 'noRedirect',
  children: [
    {
      path: 'list',
      component: () => import('@/views/users/index'),
      name: 'Users',
      meta: {
        title: 'Quản trị viên',
        icon: 'user',
        noCache: true
      }
    }
  ]
}

export default usersRouter
