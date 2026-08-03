import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_NEON_URL as string);

async function query(q: ReturnType<typeof sql>) {
  try {
    const result = await q;
    return result;
  } catch (e: any) {
    console.error('Neon query failed:', e?.message || e);
    throw e;
  }
}

export async function getTodayOverview() {
  const today = new Date().toISOString().slice(0, 10);
  const [sales, orders, users] = await Promise.all([
    query(sql`SELECT COALESCE(SUM(total_price),0)::float AS total_sales FROM order_info WHERE order_time::date = ${today}`),
    query(sql`SELECT COUNT(*)::int AS total_orders FROM order_info WHERE order_time::date = ${today}`),
    query(sql`SELECT COUNT(*)::int AS new_users FROM users WHERE create_time::date = ${today}`),
  ]);
  return {
    totalSales: (sales as any)?.[0]?.total_sales ?? 0,
    totalOrders: (orders as any)?.[0]?.total_orders ?? 0,
    newUsers: (users as any)?.[0]?.new_users ?? 0,
  };
}

export async function getTrend(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const since = d.toISOString().slice(0, 10);
  return query(sql`SELECT order_time::date AS date, COALESCE(SUM(total_price),0)::float AS amount FROM order_info WHERE order_time >= ${since} GROUP BY order_time::date ORDER BY date ASC`);
}

export async function getProductRank(limit = 10) {
  return query(sql`SELECT p.name AS product_name, SUM(o.quantity)::int AS total_quantity, SUM(o.total_price)::numeric::float AS total_sales FROM order_info o JOIN product p ON o.product_id = p.id GROUP BY o.product_id, p.name ORDER BY total_sales DESC LIMIT ${limit}`);
}

export async function getProvinceDistribution() {
  return query(sql`SELECT province AS name, COUNT(*)::int AS value FROM order_info GROUP BY province ORDER BY value DESC`);
}

export async function getOrderList(page = 1, size = 10, province?: string) {
  const offset = (page - 1) * size;
  if (province) {
    const [cr] = await query(sql`SELECT COUNT(*)::int AS total FROM order_info o WHERE o.province = ${province}`) as any;
    const records = await query(sql`SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id WHERE o.province = ${province} ORDER BY o.order_time DESC LIMIT ${size} OFFSET ${offset}`);
    return { total: cr?.total ?? 0, records, page, size };
  }
  const [cr] = await query(sql`SELECT COUNT(*)::int AS total FROM order_info`) as any;
  const records = await query(sql`SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id ORDER BY o.order_time DESC LIMIT ${size} OFFSET ${offset}`);
  return { total: cr?.total ?? 0, records, page, size };
}