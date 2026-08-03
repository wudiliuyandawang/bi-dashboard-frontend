import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_NEON_URL as string);

async function query(q: ReturnType<typeof sql>) {
  try { return await q; }
  catch (e: any) { console.error('Neon query failed:', e?.message || e); throw e; }
}

export async function getTodayOverview() {
  const today = new Date().toISOString().slice(0, 10);
  const [sales, orders, users] = await Promise.all([
    query(sql`SELECT COALESCE(SUM(total_price),0) AS total_sales FROM order_info WHERE DATE(order_time) = ${today}`),
    query(sql`SELECT COUNT(*) AS total_orders FROM order_info WHERE DATE(order_time) = ${today}`),
    query(sql`SELECT COUNT(*) AS new_users FROM users WHERE DATE(create_time) = ${today}`),
  ]);
  return {
    totalSales: Number((sales as any)?.[0]?.total_sales) || 0,
    totalOrders: Number((orders as any)?.[0]?.total_orders) || 0,
    newUsers: Number((users as any)?.[0]?.new_users) || 0,
  };
}

export async function getTrend(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const since = d.toISOString().slice(0, 10);
  const rows = await query(sql`SELECT DATE(order_time) AS dt, SUM(total_price) AS amount FROM order_info WHERE DATE(order_time) >= ${since} GROUP BY DATE(order_time) ORDER BY dt`) as any[];
  return rows.map((r: any) => ({ date: String(r.dt || '').slice(0,10), amount: Number(r.amount) || 0 }));
}

export async function getProductRank(limit = 10) {
  const rows = await query(sql`SELECT p.name AS product_name, SUM(o.quantity) AS total_quantity, SUM(o.total_price) AS total_sales FROM order_info o JOIN product p ON o.product_id = p.id GROUP BY p.name ORDER BY total_sales DESC LIMIT ${limit}`) as any[];
  return rows.map((r: any) => ({ product_name: String(r.product_name||''), total_quantity: Number(r.total_quantity)||0, total_sales: Number(r.total_sales)||0 }));
}

export async function getProvinceDistribution() {
  const rows = await query(sql`SELECT province AS name, COUNT(*) AS value FROM order_info GROUP BY province ORDER BY value DESC`) as any[];
  return rows.map((r: any) => ({ name: String(r.name||''), value: Number(r.value)||0 }));
}

export async function getOrderList(page = 1, size = 10, province?: string) {
  const offset = (page - 1) * size;
  let total = 0; let records: any[] = [];
  if (province) {
    const [cr] = await query(sql`SELECT COUNT(*) AS total FROM order_info WHERE province = ${province}`) as any;
    total = Number(cr?.total) || 0;
    records = await query(sql`SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id WHERE o.province = ${province} ORDER BY o.order_time DESC LIMIT ${size} OFFSET ${offset}`) as any[];
  } else {
    const [cr] = await query(sql`SELECT COUNT(*) AS total FROM order_info`) as any;
    total = Number(cr?.total) || 0;
    records = await query(sql`SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id ORDER BY o.order_time DESC LIMIT ${size} OFFSET ${offset}`) as any[];
  }
  return { total, records, page, size };
}