<template>
  <div class="dashboard-container">
    <!-- 标题区 -->
    <div class="header">
      <h2 class="title">销售数据 BI 可视化看板</h2>
      <div class="subtitle">Sales Data Visualization Dashboard</div>
    </div>

    <!-- 顶部统计卡片 -->
    <div class="card-row">
      <div class="stat-card">
        <div class="card-icon sales">¥</div>
        <div class="card-content">
          <div class="card-label">今日总销售额</div>
          <div class="card-value">
            <CountUp :endVal="overview.totalSales || 0" :decimals="2" :duration="2" />
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="card-icon order">📦</div>
        <div class="card-content">
          <div class="card-label">今日总订单数</div>
          <div class="card-value">
            <CountUp :endVal="overview.totalOrders || 0" :duration="2" />
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="card-icon user">👤</div>
        <div class="card-content">
          <div class="card-label">今日新增用户</div>
          <div class="card-value">
            <CountUp :endVal="overview.newUsers || 0" :duration="2" />
          </div>
        </div>
      </div>
    </div>

    <!-- 图表第一行：折线图 + 柱状图 -->
    <div class="chart-row">
      <div class="chart-box">
        <div class="chart-title">
          <span class="title-dot"></span>
          近30天销售趋势
        </div>
        <div ref="trendChartRef" class="chart"></div>
      </div>
      <div class="chart-box">
        <div class="chart-title">
          <span class="title-dot"></span>
          商品销量排行榜
        </div>
        <div ref="rankChartRef" class="chart"></div>
      </div>
    </div>

    <!-- 图表第二行：饼图 + 筛选区 -->
    <div class="chart-row">
      <div class="chart-box half">
        <div class="chart-title">
          <span class="title-dot"></span>
          用户地域分布
        </div>
        <div ref="pieChartRef" class="chart"></div>
      </div>
      <div class="chart-box half">
        <div class="chart-title">
          <span class="title-dot"></span>
          订单筛选
        </div>
        <div class="filter-content">
          <el-input 
            v-model="provinceFilter" 
            placeholder="输入省份筛选，如：广东"
            class="filter-input"
          />
          <el-button type="primary" class="filter-btn" @click="getOrderList">查询</el-button>
          <div class="filter-tip">💡 支持按省份精准筛选订单数据</div>
        </div>
      </div>
    </div>

    <!-- 底部订单表格 -->
    <div class="table-box">
      <div class="chart-title">
        <span class="title-dot"></span>
        订单明细数据
      </div>
      <el-table :data="orderList" border stripe class="bi-table">
        <el-table-column prop="id" label="订单ID" width="90" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="quantity" label="购买数量" width="120" />
        <el-table-column prop="total_price" label="订单金额(元)" width="140" />
        <el-table-column prop="province" label="省份" width="110" />
        <el-table-column prop="order_time" label="下单时间" width="200" />
      </el-table>
      <el-pagination
        class="bi-pagination"
        background
        layout="total, prev, pager, next, sizes"
        :total="total"
        :current-page="page"
        :page-size="size"
        :page-sizes="[5, 10, 20, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import CountUp from 'vue-countup-v3'
import { getTodayOverview, getTrend, getProductRank, getProvinceDistribution, getOrderList } from '../api/orders'
import { ElMessage } from 'element-plus'

// 响应式数据
const overview = ref({})
const orderList = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const provinceFilter = ref('')

// 图表DOM引用
const trendChartRef = ref(null)
const rankChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart, rankChart, pieChart

// 1. 获取今日概览数据
const loadOverview = async () => {
  try {
    overview.value = await getTodayOverview()
  } catch (e) {
    ElMessage.error('今日概览数据加载失败')
  }
}

// 2. 获取近30天销售趋势（渐变折线图）
const loadTrend = async () => {
  try {
    const res = await getTrend(30)
    const dateList = res.map(item => item.date.slice(0, 10))
    const amountList = res.map(item => item.amount)

    trendChart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dateList,
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8ab4d8' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8ab4d8' }
      },
      series: [{
        data: amountList,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#00d4ff' },
        itemStyle: { color: '#00d4ff', shadowBlur: 10, shadowColor: '#00d4ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.02)' }
          ])
        },
        animationDuration: 2000
      }]
    })
  } catch (e) {
    ElMessage.error('趋势数据加载失败')
  }
}

// 3. 获取商品销量排行榜（渐变柱状图）
const loadProductRank = async () => {
  try {
    const res = await getProductRank(10)
    const nameList = res.map(item => item.product_name)
    const qtyList = res.map(item => item.total_quantity)

    rankChart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#7c3aed', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8ab4d8' }
      },
      yAxis: {
        type: 'category',
        data: nameList,
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#8ab4d8' }
      },
      series: [{
        data: qtyList,
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#4c1d95' },
            { offset: 1, color: '#7c3aed' }
          ]),
          shadowBlur: 8,
          shadowColor: 'rgba(124, 58, 237, 0.4)'
        },
        animationDuration: 2000
      }]
    })
  } catch (e) {
    ElMessage.error('商品排行数据加载失败')
  }
}

// 4. 获取用户地域分布（环形饼图）
const loadProvince = async () => {
  try {
    const res = await getProvinceDistribution()
    
    pieChart.setOption({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', textStyle: { color: '#fff' } },
      legend: { bottom: '0', textStyle: { color: '#8ab4d8' } },
      series: [{
        type: 'pie',
        radius: ['40%', '65%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0f172a',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#e2e8f0',
          formatter: '{b}\n{c}单'
        },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 212, 255, 0.6)' }
        },
        data: res,
        animationDuration: 2000
      }]
    })
  } catch (e) {
    ElMessage.error('地域分布数据加载失败')
  }
}

// 5. 获取订单明细列表
const loadOrderList = async () => {
  try {
    const res = await getOrderList(page.value, size.value, provinceFilter.value || undefined)
    orderList.value = res.records
    total.value = res.total
  } catch (e) {
    ElMessage.error('订单列表加载失败')
  }
}

// 分页事件
const handlePageChange = (newPage) => {
  page.value = newPage
  getOrderList()
}
const handleSizeChange = (newSize) => {
  size.value = newSize
  page.value = 1
  getOrderList()
}

// 窗口大小变化时，图表自适应
const resizeCharts = () => {
  trendChart?.resize()
  rankChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  // 初始化图表实例
  trendChart = echarts.init(trendChartRef.value)
  rankChart = echarts.init(rankChartRef.value)
  pieChart = echarts.init(pieChartRef.value)

  // 调用所有接口加载数据
  loadOverview()
  loadTrend()
  loadProductRank()
  loadProvince()
  loadOrderList()

  // 监听窗口缩放
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  // 销毁图表，释放内存
  trendChart?.dispose()
  rankChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
/* 整体容器：深色背景 + 网格纹理 */
.dashboard-container {
  padding: 24px;
  min-height: 100vh;
  box-sizing: border-box;
  background-image: 
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  background-size: 40px 40px, 40px 40px, 100% 100%;
}

/* 标题区 */
.header {
  text-align: center;
  margin-bottom: 24px;
}
.title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(90deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}
.subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* 统计卡片行 */
.card-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 毛玻璃统计卡片 */
.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 26px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 8px 30px rgba(0, 212, 255, 0.15);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}
.card-icon.sales {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.05));
  color: #00d4ff;
}
.card-icon.order {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.05));
  color: #a78bfa;
}
.card-icon.user {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05));
  color: #22c55e;
}

.card-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.card-value {
  font-size: 30px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1;
}

/* 图表行 */
.chart-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 图表卡片容器 */
.chart-box {
  flex: 1;
  padding: 20px 22px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.chart-box:hover {
  border-color: rgba(0, 212, 255, 0.3);
}
.chart-box.half {
  flex: 1;
}

/* 图表标题 */
.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}
.title-dot {
  width: 6px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, #00d4ff, #7c3aed);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}

.chart {
  width: 100%;
  height: 300px;
}

/* 筛选区 */
.filter-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 10px;
}
.filter-input {
  width: 100%;
}
.filter-btn {
  width: 100%;
  background: linear-gradient(90deg, #00d4ff, #7c3aed);
  border: none;
}
.filter-tip {
  font-size: 12px;
  color: #64748b;
  padding-left: 4px;
}

/* 表格区 */
.table-box {
  padding: 20px 22px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 表格深色主题适配 */
:deep(.bi-table) {
  --el-table-bg-color: transparent;
  --el-table-header-bg-color: rgba(15, 23, 42, 0.6);
  --el-table-row-hover-bg-color: rgba(0, 212, 255, 0.08);
  --el-table-border-color: rgba(0, 212, 255, 0.1);
  --el-text-color-primary: #e2e8f0;
  --el-text-color-secondary: #94a3b8;
}
:deep(.bi-table .el-table__body tr:hover > td) {
  background-color: rgba(0, 212, 255, 0.08) !important;
}

/* 分页深色主题适配 */
.bi-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
:deep(.bi-pagination .el-pagination) {
  --el-pagination-color: #94a3b8;
  --el-pagination-hover-color: #00d4ff;
  --el-pagination-bg-color: rgba(30, 41, 59, 0.8);
  --el-border-color: rgba(0, 212, 255, 0.15);
}
</style>
