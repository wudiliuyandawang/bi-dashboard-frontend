function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n
}

const now = new Date()
const dates = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(now.getTime() - (29 - i) * 86400000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
})

const products = [
  'iPhone 15 Pro Max',
  'MacBook Air M3',
  'AirPods Pro 2',
  'iPad Pro M4',
  'Apple Watch Ultra 2',
  'iMac 24',
  'HomePod mini',
  'Magic Keyboard',
  'Apple Pencil Pro',
  'Studio Display',
  'Mac mini M4',
  'AirTag',
]

const provinces = [
  '广东', '北京', '上海', '浙江', '江苏',
  '四川', '湖北', '山东', '福建', '河南',
]

export const mockTodayOverview = () => ({
  totalSales: random(80000, 250000) + random(0, 99) / 100,
  totalOrders: random(200, 800),
  newUsers: random(50, 300),
})

export const mockTrend = () =>
  dates.map((date) => ({
    date,
    revenue: random(60000, 180000) + random(0, 99) / 100,
    orders: random(150, 600),
  }))

export const mockProductRank = () =>
  products
    .map((name) => ({ name, value: random(100, 2000) }))
    .sort((a, b) => b.value - a.value)

export const mockProvinceDistribution = () =>
  provinces.map((name) => ({
    name,
    value: random(300, 3000),
  }))

export const mockOrderList = (page: number, size: number, province?: string) => {
  let total = 238
  let list: Array<Record<string, unknown>> = []
  const start = (page - 1) * size

  if (province) {
    total = random(8, 40)
  }

  for (let i = 0; i < Math.min(size, total - start); i++) {
    const idx = start + i + 1
    const p = province || provinces[random(0, provinces.length - 1)]
    const product = products[random(0, products.length - 1)]
    const qty = random(1, 10)
    const price = random(99, 12999) + random(0, 99) / 100
    const d = new Date(now.getTime() - random(0, 30) * 86400000 - random(0, 23) * 3600000 - random(0, 59) * 60000)
    list.push({
      id: idx,
      product_name: product,
      quantity: qty,
      total_price: Math.round(price * qty * 100) / 100,
      province: p,
      order_time: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    })
  }
  return { records: list, total }
}
