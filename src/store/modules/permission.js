import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const permissions = store.getters.permissions
      console.log(permissions)
      let accessedRoutes
      const menu = generaMenu(asyncRoutes, permissions)
      console.log(menu)
      if (roles.includes('root')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      console.log(accessedRoutes[1])
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

/**
 * 后台查询的菜单数据拼装成路由格式的数据
 * @param routes
 * @param data
 */
export function generaMenu(routes, data) {
  data.forEach(item => {
    // alert(JSON.stringify(item))
    const menu = {
      path: item.url === '#' ? item.name : item.url,
      // component: item.url === '#' ? Layout : resolve => require([`@/views/${item.url}`], resolve),
      component: item.url === '#' ? Layout : resolve => require([`@/views${item.url}`], resolve),
      // 根据权限类型判断是否需要显示菜单
      hidden: !parseInt(item.type),
      children: [],
      name: item.name,
      meta: { title: item.display_name, icon: item.icon, id: item.id }
    }
    if (item.children && item.children.length > 0) {
      // 设置父级菜单的redirect
      menu.redirect = item.children[0].url
      generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
