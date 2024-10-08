

## 脚手架目录结构
```
├── src
│   ├── App.tsx
│   ├── api                     # 接口管理模块
│   ├── assets                  # 静态资源模块
│   ├── components              # 公共组件模块
│   ├── i18n                    # 国际化模块
│   ├── mock                    # mock接口模拟模块
│   ├── layouts                 # 公共自定义布局
│   ├── main.ts                 # 入口文件
│   ├── public                  # 公共资源模块
│   ├── router                  # 路由
│   ├── store                   # vuex状态库
│   ├── types                   # 声明文件
│   ├── utils                   # 公共方法模块
│   └── views                   # 视图模块
├── tsconfig.json
└── vite.config.js
```

## 什么是Vite

> 下一代前端开发与构建工具
Vite（法语意为 "快速的"，发音 `/vit/`，发音同 "veet"）是一种新型前端构建工具，能够显著提升前端开发体验。它主要由两部分组成：

-   一个开发服务器，它基于 [原生 ES 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) 提供了 [丰富的内建功能](https://vitejs.cn/guide/features.html)，如速度快到惊人的 [模块热更新（HMR）](https://vitejs.cn/guide/features.html#hot-module-replacement)。
-   一套构建指令，它使用 [Rollup](https://rollupjs.org/) 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

Vite 意在提供开箱即用的配置，同时它的 [插件 API](https://vitejs.cn/guide/api-plugin.html) 和 [JavaScript API](https://vitejs.cn/guide/api-javascript.html) 带来了高度的可扩展性，并有完整的类型支持。

你可以在 [为什么选 Vite](https://vitejs.cn/guide/why.html) 中了解更多关于项目的设计初衷。

## 什么是Pinia
Pinia.js 是新一代的状态管理器，由 Vue.js团队中成员所开发的，因此也被认为是下一代的 Vuex，即 Vuex5.x，在 Vue3.0 的项目中使用也是备受推崇

Pinia.js 有如下特点：
-   相比Vuex更加完整的 typescript 的支持；
-   足够轻量，压缩后的体积只有1.6kb;
-   去除 mutations，只有 state，getters，actions（支持同步和异步）；
-   使用相比Vuex更加方便，每个模块独立，更好的代码分割，没有模块嵌套，store之间可以自由使用

### 安装

```js
npm install pinia --save
```
### 创建Store
- 新建 src/store 目录并在其下面创建 index.ts，并导出store
```js
import { createPinia } from 'pinia'

const store = createPinia()

export default store
```
- 在main.ts中引入

```js
import { createApp } from 'vue'
import store from './store'

const app = createApp(App)

app.use(store)
```
### 定义State
在新建src/store/modules，根据模块划分在modules下新增common.ts


```js
import { defineStore } from 'pinia'

export const CommonStore = defineStore('common', {
  // 状态库
  state: () => ({
    userInfo: null, //用户信息
  }),
})
```
###  获取State
获取state有多种方式，最常用一下几种： 

```js
import { CommonStore } from '@/store/modules/common'
// 在此省略defineComponent
setup(){
    const commonStore = CommonStore()
    return ()=>(
        <div>{commonStore.userInfo}</div>
    )
}
```
使用computed获取
```js
const userInfo = computed(() => commonStore.userInfo)
```
使用Pinia提供的**storeToRefs**

```js
import { storeToRefs } from 'pinia'
import { CommonStore } from '@/store/modules/common'

...
const commonStore = CommonStore()
const { userInfo } = storeToRefs(commonStore)
```
### 修改State
修改state的三种方式：

1. 直接修改（不推荐）

```js
commonStore.userInfo = '曹操'
```
2. 通过$patch

```js
commonStore.$patch({
    userInfo:'曹操'
})
```
3. 通过actions修改store

```js
export const CommonStore = defineStore('common', {
  // 状态库
  state: () => ({
    userInfo: null, //用户信息
  }),
  actions: {
    setUserInfo(data) {
      this.userInfo = data
    },
  },
})
```

```js
import { CommonStore } from '@/store/modules/common'

const commonStore = CommonStore()
commonStore.setUserInfo('曹操')
```
### Getters

```js
export const CommonStore = defineStore('common', {
  // 状态库
  state: () => ({
    userInfo: null, //用户信息
  }),
  getters: {
    getUserInfo: (state) => state.userInfo
  }
})
```
使用同State获取

### Actions
Pinia赋予了Actions更大的职能，相较于Vuex，Pinia去除了Mutations，仅依靠Actions来更改Store状态，同步异步都可以放在Actions中。

#### 同步action

```js
export const CommonStore = defineStore('common', {
  // 状态库
  state: () => ({
    userInfo: null, //用户信息
  }),
  actions: {
    setUserInfo(data) {
      this.userInfo = data
    },
  },
})
```
#### 异步actions

```js
...
actions: {
   async getUserInfo(params) {
      const data = await api.getUser(params)
      return data
    },
}
```

#### 内部actions间相互调用

```js
...
actions: {
   async getUserInfo(params) {
      const data = await api.getUser(params)
      this.setUserInfo(data)
      return data
    },
    setUserInfo(data){
       this.userInfo = data
    }
}
```

#### modules间actions相互调用

```js
import { UserStore } from './modules/user'

...
actions: {
   async getUserInfo(params) {
      const data = await api.getUser(params)
      const userStore = UserStore()
      userStore.setUserInfo(data)
      return data
    },
}
```

### pinia-plugin-persist 插件实现数据持久化

#### 安装
```js
npm i pinia-plugin-persist --save
```
#### 使用

```js
// src/store/index.ts

import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'

const store = createPinia().use(piniaPluginPersist)

export default store
```
对应store中的使用

```js
export const CommonStore = defineStore('common', {
  // 状态库
  state: () => ({
    userInfo: null, //用户信息
  }),
  // 开启数据缓存
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage, // 默认存储在sessionStorage里
        paths: ['userInfo'],  // 指定存储state，不写则存储所有
      },
    ],
  },
})
```

![WX20220224-151530.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d926043927f5451ab68a1b0cc9c6ecb7~tplv-k3u1fbpfcp-watermark.image?)

## Fetch
为了更好的支持TypeScript，统计Api请求，这里将axios进行二次封装

结构目录：

![WX20220224-155540@2x.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86f3fb7b98ee4d43af26b2cc681b5e6c~tplv-k3u1fbpfcp-watermark.image?)
```js
// src/utils/fetch.ts

import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios'
import { getToken } from './util'
import { Modal } from 'ant-design-vue'
import { Message, Notification } from '@/utils/resetMessage'

// .env环境变量
const BaseUrl = import.meta.env.VITE_API_BASE_URL as string

// create an axios instance
const service: AxiosInstance = axios.create({
  baseURL: BaseUrl, // 正式环境
  timeout: 60 * 1000,
  headers: {},
})

/**
 * 请求拦截
 */
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    config.headers.common.Authorization = getToken() // 请求头带上token
    config.headers.common.token = getToken()
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * 响应拦截
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status == 201 || response.status == 200) {
      const { code, status, msg } = response.data
      if (code == 401) {
        Modal.warning({
          title: 'token出错',
          content: 'token失效，请重新登录！',
          onOk: () => {
            sessionStorage.clear()
          },
        })
      } else if (code == 200) {
        if (status) {
          // 接口请求成功
          msg && Message.success(msg) // 后台如果返回了msg，则将msg提示出来
          return Promise.resolve(response) // 返回成功数据
        }
        // 接口异常
        msg && Message.warning(msg) // 后台如果返回了msg，则将msg提示出来
        return Promise.reject(response) // 返回异常数据
      } else {
        // 接口异常
        msg && Message.error(msg)
        return Promise.reject(response)
      }
    }
    return response
  },
  (error) => {
    if (error.response.status) {
      switch (error.response.status) {
        case 500:
          Notification.error({
            message: '温馨提示',
            description: '服务异常，请重启服务器！',
          })
          break
        case 401:
          Notification.error({
            message: '温馨提示',
            description: '服务异常，请重启服务器！',
          })
          break
        case 403:
          Notification.error({
            message: '温馨提示',
            description: '服务异常，请重启服务器！',
          })
          break
        // 404请求不存在
        case 404:
          Notification.error({
            message: '温馨提示',
            description: '服务异常，请重启服务器！',
          })
          break
        default:
          Notification.error({
            message: '温馨提示',
            description: '服务异常，请重启服务器！',
          })
      }
    }
    return Promise.reject(error.response)
  },
)

interface Http {
  fetch<T>(params: AxiosRequestConfig): Promise<StoreState.ResType<T>>
}

const http: Http = {
  // 用法与axios一致（包含axios内置所有请求方式）
  fetch(params) {
    return new Promise((resolve, reject) => {
      service(params)
        .then((res) => {
          resolve(res.data)
        })
        .catch((err) => {
          reject(err.data)
        })
    })
  },
}

export default http['fetch']

```
### 使用

```js
// src/api/user.ts

import qs from 'qs'
import fetch from '@/utils/fetch'
import { IUserApi } from './types/user'

const UserApi: IUserApi = {
  // 登录
  login: (params) => {
    return fetch({
      method: 'post',
      url: '/login',
      data: params,
    })
  }
}

export default UserApi

```

### 类型定义

```js
/**
 * 接口返回结果Types
 * --------------------------------------------------------------------------
 */
// 登录返回结果
export interface ILoginData {
  token: string
  userInfo: {
    address: string
    username: string
  }
}

/**
 * 接口参数Types
 * --------------------------------------------------------------------------
 */
// 登录参数
export interface ILoginApiParams {
  username: string // 用户名
  password: string // 密码
  captcha: string // 验证码
  uuid: string // 验证码uuid
}

/**
 * 接口定义Types
 * --------------------------------------------------------------------------
 */
export interface IUserApi {
  login: (params: ILoginApiParams) => Promise<StoreState.ResType<ILoginData>>
}

```

## 国际化配置

### 安装
引入i18n依赖包，注意vue3中配置i18n需要安装 [V9+版本](https://github.com/intlify/vue-i18n-next)、

```
npm install vue-i18n@9
```
### 配置
该脚手架i18n采用模块化的设计思路：
>`src/i18n/model`对应不同模块的国际化文件（根据实际业务创建），`src/i18n/lang`对应不同语言包（集成所有模块的语言定义），`src/i18n/index.ts`创建i18n实例，并导出。
```js
//src/model/menu.ts
export default {
    zh: {
        userManage: '用户管理'
    },
    en: {
        userManage: 'User Manage'
    }
}
```

```js
//src/lang/en_US.ts
import Menu from '../model/menu'

export default {
	menu: Menu.en
}
```

```js
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'

import zh_CN from './lang/zh_CN'
import en from './lang/en_US'

const localLang = localStorage.getItem('localLang')

const i18n = createI18n({
	legacy: false, 
	globalInjection: true, // 全局模式，可以直接使用 $t
	locale: localLang as string,
	messages: {
		'zh-cn': zh_CN, // 中文语言包
		en: en // 英文语言包
	}
})

export default i18n
```
其中 `createI18n`配置项中：  
- `legacy`：默认值为false，当使用 Composition API 时需要设置成true，否则会报以下类型错误：
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32a70692d65f442780c31ff48dfccba0~tplv-k3u1fbpfcp-watermark.image?)
- `globalInjection`: 默认值为true， true: 可以直接使用 `$t`声明，如$t('menu.authManage')；false: 通过局部组件单独引入的形式，下面会提到。
- `locale`: 当前展示的语言，**ps：需注意与messages定义的key名称对应**
- `messages`: 不同语言对应的语言包集合

### 在main.ts中引入

```
// src/main.ts 
...
import i18n from '@/i18n'
app.use(i18n)
...
```
### 如何在文件中使用
上文说到在创建`createI18n`实例时有一个`globalInjection`配置项，配置的不同，使用方式也不同，具体如下：  
- globalInjection:false

```
<template>
    {{t('menu.userManage')}}
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```
- globalInjection:true
```
<template>
    {{$t('menu.userManage')}}
</template>
<script setup lang="ts">
</script>
```
### 切换语言

在App.ts中`provide`一个切换语言的方法`changeLang`，主要代码如下：

```js
//src/App.ts
...
import { provide } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
// setup
const changeLang = (lang: string) => {
  locale['value'] = lang
  localStorage.setItem('localLang', lang)
}
```
调用`changeLang`方法

```js
import { inject } from 'vue'
// 注入切换语言方法
const changeLang = inject('changeLang')

<div class="switch-lang">
        <a-select @select="changeLang" v-model:value="lang" placeholder="语言切换">
                <a-select-option value='zh-cn'>中文</a-select-option>
                <a-select-option value='en'>英文</a-select-option>
        </a-select>
</div>
```

## Router4
1. 基础路由
```js
// src/router/router.config.ts

const Routes: Array<RouteRecordRaw> = [
  {
    path: '/403',
    name: '403',
    component: () =>
      import(/* webpackChunkName: "403" */ '@/views/exception/403'),
    meta: { title: '403', permission: ['exception'], hidden: true },
  },
  {
    path: '/404',
    name: '404',
    component: () =>
      import(/* webpackChunkName: "404" */ '@/views/exception/404'),
    meta: { title: '404', permission: ['exception'], hidden: true },
  },
  {
    path: '/500',
    name: '500',
    component: () =>
      import(/* webpackChunkName: "500" */ '@/views/exception/500'),
    meta: { title: '500', permission: ['exception'], hidden: true },
  },
  {
    path: '/:pathMatch(.*)',
    name: 'error',
    component: () =>
      import(/* webpackChunkName: "404" */ '@/views/exception/404'),
    meta: { title: '404', hidden: true },
  },
]
```
> title： 导航显示文字；hidden: 导航上是否隐藏该路由 (true: 不显示 false:显示)
2. 动态路由(权限路由)

```js
// src/router/router.ts

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const token: string = getToken() as string
    if (token) {
      // 第一次加载路由列表并且该项目需要动态路由
      if (!isAddDynamicMenuRoutes) {
        try {
          //获取动态路由表
          const res: any = await UserApi.getPermissionsList({})
          if (res.code == 200) {
            isAddDynamicMenuRoutes = true
            const menu = res.data
            // 通过路由表生成标准格式路由
            const menuRoutes: any = fnAddDynamicMenuRoutes(
              menu.menuList || [],
              [],
            )
            mainRoutes.children = []
            mainRoutes.children?.unshift(...menuRoutes, ...Routes)
            // 动态添加路由
            router.addRoute(mainRoutes)
            // 注：这步很关键，不然导航获取不到路由
            router.options.routes.unshift(mainRoutes)
            // 本地存储按钮权限集合
            sessionStorage.setItem(
              'permissions',
              JSON.stringify(menu.permissions || '[]'),
            )
            if (to.path == '/' || to.path == '/login') {
              const firstName = menuRoutes.length && menuRoutes[0].name
              next({ name: firstName, replace: true })
            } else {
              next({ path: to.fullPath })
            }
          } else {
            sessionStorage.setItem('menuList', '[]')
            sessionStorage.setItem('permissions', '[]')
            next()
          }
        } catch (error) {
          console.log(
            `%c${error} 请求菜单列表和权限失败，跳转至登录页！！`,
            'color:orange',
          )
        }
      } else {
        if (to.path == '/' || to.path == '/login') {
          next(from)
        } else {
          next()
        }
      }
    } else {
      isAddDynamicMenuRoutes = false
      if (to.name != 'login') {
        next({ name: 'login' })
      }
      next()
    }
  },
)
```

## 相关参考链接
- [Pinia官网](https://pinia.vuejs.org/)
- [Vue3官网](https://v3.cn.vuejs.org/guide/introduction.html)
- [Vite](https://vitejs.cn/)
- [Antd Design Vue](https://2x.antdv.com/components/overview-cn/)








