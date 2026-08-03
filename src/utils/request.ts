import axios from 'axios'
import {
  mockTodayOverview,
  mockTrend,
  mockProductRank,
  mockProvinceDistribution,
  mockOrderList,
} from './mock'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const url: string = error.config?.url || ''
    if (url.includes('/orders/today-overview')) {
      return Promise.resolve(mockTodayOverview())
    }
    if (url.includes('/orders/trend')) {
      return Promise.resolve(mockTrend())
    }
    if (url.includes('/orders/product-rank')) {
      return Promise.resolve(mockProductRank())
    }
    if (url.includes('/orders/province-distribution')) {
      return Promise.resolve(mockProvinceDistribution())
    }
    if (url.includes('/orders/list')) {
      const params = error.config?.params || {}
      return Promise.resolve(
        mockOrderList(params.page || 1, params.size || 10, params.province),
      )
    }
    console.error('request failed:', error)
    return Promise.reject(error)
  },
)

export default request