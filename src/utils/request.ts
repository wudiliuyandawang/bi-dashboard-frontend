import axios from 'axios'

// 创建请求实例
const request = axios.create({
  baseURL: '/api', // 统一前缀，配合代理自动转发
  timeout: 10000
})

// 响应拦截：直接返回后端数据
request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('接口请求失败：', error)
    return Promise.reject(error)
  }
)

export default request