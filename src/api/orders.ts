import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_NEON_URL as string);

export async function getTodayOverview() {
  const today = new Date().toISOString().slice(0, 10);
  const [sales, orders, users] = await Promise.all([
    sql`SELECT COALESCE(SUM(total_price),0)::float AS total_sales FROM order_info WHERE order_time::date = ${today}`,
    sql`SELECT COUNT(*)::int AS total_orders FROM order_info WHERE order_time::date = ${today}`,
    sql`SELECT COUNT(*)::int AS new_users FROM users WHERE create_time::date = ${today}`,
  ]);
  return {
    totalSales: (sales as any)[0]?.total_sales ?? 0,
    totalOrders: (orders as any)[0]?.total_orders ?? 0,
    newUsers: (users as any)[0]?.new_users ?? 0,
  };
}

export async function getTrend(days = 7) {
  return sql`SELECT order_time::date AS date, COALESCE(SUM(total_price),0)::float AS amount FROM order_info WHERE order_time >= CURRENT_DATE - ${days}::int GROUP BY order_time::date ORDER BY date ASC`;
}

export async function getProductRank(limit = 10) {
  return sql`SELECT p.name AS product_name, SUM(o.quantity)::int AS total_quantity, SUM(o.total_price)::numeric::float AS total_sales FROM order_info o JOIN product p ON o.product_id = p.id GROUP BY o.product_id, p.name ORDER BY total_sales DESC LIMIT ${limit}`;
}

export async function getProvinceDistribution() {
  return sql`SELECT province AS name, COUNT(*)::int AS value FROM order_info GROUP BY province ORDER BY value DESC`;
}

export async function getOrderList(page = 1, size = 10, province?: string) {
  const offset = (page - 1) * size;
  let countResult, records;
  if (province) {
    [countResult] = await sql`SELECT COUNT(*)::int AS total FROM order_info o WHERE o.province = ${province}`;
    const total = (countResult as any)?.total ?? 0;
    records = await sql`SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id WHERE o.province = ${province} ORDER BY o.order_time DESC LIMIT ${size} OFFSET ${offset}`;
    return { total, records, page, size };
  }
  [countResult] = await sql`SELECT COUNT(*)::int AS total FROM order_info`;
  const total = (countResult as any)?.total ?? 0;
  records = await sql`SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id ORDER BY o.order_time DESC LIMIT ${size} OFFSET ${offset}`;
  return { total, records, page, size };
}