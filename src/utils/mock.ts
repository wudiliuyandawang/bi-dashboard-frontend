const realOverview = { newUsers: 0, totalSales: 0.00, totalOrders: 0 }
function pad(n: number) { return n < 10 ? '0' + n : '' + n }
const now = new Date()
const realTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(now.getTime() - (29 - i) * 86400000)
  return {
    date: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
    amount: Math.round((Math.random() * 80000 + 60000) * 100) / 100,
    orders: Math.floor(Math.random() * 200 + 100),
  }
})
const realProductRank = [
  { product_name: "MacBook Pro", total_quantity: 2, total_sales: 25998.00 },
  { product_name: "iPhone 15", total_quantity: 3, total_sales: 17997.00 },
  { product_name: "华为平板", total_quantity: 2, total_sales: 6998.00 },
  { product_name: "显示器", total_quantity: 2, total_sales: 3998.00 },
  { product_name: "Nike 跑鞋", total_quantity: 3, total_sales: 2697.00 },
  { product_name: "蓝牙耳机", total_quantity: 5, total_sales: 1495.00 },
  { product_name: "运动T恤", total_quantity: 8, total_sales: 1192.00 },
  { product_name: "机械键盘", total_quantity: 2, total_sales: 998.00 },
  { product_name: "双肩包", total_quantity: 3, total_sales: 777.00 },
  { product_name: "充电宝", total_quantity: 3, total_sales: 387.00 },
]
const realProvince = [
  { name: "广东", value: 6 }, { name: "上海", value: 3 },
  { name: "北京", value: 3 }, { name: "浙江", value: 3 },
  { name: "湖北", value: 2 }, { name: "四川", value: 2 },
  { name: "江苏", value: 2 },
]
const allRecords = [
  { id: 21, user_id: 2, product_id: 1, product_name: "iPhone 15", quantity: 1, total_price: 5999.00, province: "广东", order_time: "2026-07-17T13:41:21" },
  { id: 20, user_id: 3, product_id: 10, product_name: "双肩包", quantity: 2, total_price: 518.00, province: "浙江", order_time: "2026-07-04T12:25:00" },
  { id: 19, user_id: 4, product_id: 9, product_name: "充电宝", quantity: 1, total_price: 129.00, province: "上海", order_time: "2026-07-03T15:55:00" },
  { id: 18, user_id: 2, product_id: 8, product_name: "显示器", quantity: 1, total_price: 1999.00, province: "北京", order_time: "2026-07-02T13:30:00" },
  { id: 17, user_id: 3, product_id: 6, product_name: "运动T恤", quantity: 3, total_price: 447.00, province: "广东", order_time: "2026-07-01T08:10:00" },
  { id: 16, user_id: 4, product_id: 4, product_name: "华为平板", quantity: 1, total_price: 3499.00, province: "湖北", order_time: "2026-06-30T10:45:00" },
  { id: 15, user_id: 2, product_id: 2, product_name: "MacBook Pro", quantity: 1, total_price: 12999.00, province: "四川", order_time: "2026-06-29T16:00:00" },
  { id: 14, user_id: 3, product_id: 7, product_name: "机械键盘", quantity: 1, total_price: 499.00, province: "江苏", order_time: "2026-06-28T11:20:00" },
  { id: 13, user_id: 4, product_id: 5, product_name: "蓝牙耳机", quantity: 2, total_price: 598.00, province: "广东", order_time: "2026-06-27T14:15:00" },
  { id: 12, user_id: 2, product_id: 3, product_name: "Nike 跑鞋", quantity: 1, total_price: 899.00, province: "浙江", order_time: "2026-06-26T09:35:00" },
  { id: 11, user_id: 3, product_id: 1, product_name: "iPhone 15", quantity: 1, total_price: 5999.00, province: "上海", order_time: "2026-06-25T17:50:00" },
  { id: 10, user_id: 4, product_id: 10, product_name: "双肩包", quantity: 1, total_price: 259.00, province: "北京", order_time: "2026-06-24T12:40:00" },
  { id: 9, user_id: 2, product_id: 9, product_name: "充电宝", quantity: 2, total_price: 258.00, province: "广东", order_time: "2026-06-23T10:05:00" },
  { id: 8, user_id: 3, product_id: 8, product_name: "显示器", quantity: 1, total_price: 1999.00, province: "湖北", order_time: "2026-06-22T15:25:00" },
  { id: 7, user_id: 4, product_id: 7, product_name: "机械键盘", quantity: 1, total_price: 499.00, province: "四川", order_time: "2026-06-21T13:10:00" },
  { id: 6, user_id: 2, product_id: 6, product_name: "运动T恤", quantity: 5, total_price: 745.00, province: "江苏", order_time: "2026-06-20T08:30:00" },
  { id: 5, user_id: 3, product_id: 5, product_name: "蓝牙耳机", quantity: 3, total_price: 897.00, province: "浙江", order_time: "2026-06-19T11:00:00" },
  { id: 4, user_id: 4, product_id: 4, product_name: "华为平板", quantity: 1, total_price: 3499.00, province: "广东", order_time: "2026-06-18T16:45:00" },
  { id: 3, user_id: 2, product_id: 3, product_name: "Nike 跑鞋", quantity: 2, total_price: 1798.00, province: "上海", order_time: "2026-06-17T09:15:00" },
  { id: 2, user_id: 3, product_id: 2, product_name: "MacBook Pro", quantity: 1, total_price: 12999.00, province: "北京", order_time: "2026-06-16T14:20:00" },
  { id: 1, user_id: 2, product_id: 1, product_name: "iPhone 15", quantity: 1, total_price: 5999.00, province: "广东", order_time: "2026-06-15T10:30:00" },
]

export const mockTodayOverview = () => realOverview
export const mockTrend = () => realTrend
export const mockProductRank = () => realProductRank
export const mockProvinceDistribution = () => realProvince
export const mockOrderList = (page: number, size: number, province?: string) => {
  let filtered = province ? allRecords.filter((r) => r.province === province) : allRecords
  const total = filtered.length
  const records = filtered.slice((page - 1) * size, page * size)
  return { total, size, records, page }
}