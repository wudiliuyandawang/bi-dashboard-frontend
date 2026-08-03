import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_NEON_URL as string);

export async function getTodayOverview() {
  const today = new Date().toISOString().slice(0, 10);
  const [sales, orders, users] = await Promise.all([
    sql("SELECT COALESCE(SUM(total_price),0)::float AS total_sales FROM order_info WHERE order_time::date = $1", [today]) as any,
    sql("SELECT COUNT(*)::int AS total_orders FROM order_info WHERE order_time::date = $1", [today]) as any,
    sql("SELECT COUNT(*)::int AS new_users FROM users WHERE create_time::date = $1", [today]) as any,
  ]);
  return {
    totalSales: sales[0]?.total_sales ?? 0,
    totalOrders: orders[0]?.total_orders ?? 0,
    newUsers: users[0]?.new_users ?? 0,
  };
}

export async function getTrend(days = 7) {
  return sql(
    "SELECT order_time::date AS date, COALESCE(SUM(total_price),0)::float AS amount FROM order_info WHERE order_time >= CURRENT_DATE - $1::int GROUP BY order_time::date ORDER BY date ASC",
    [days]
  ) as any;
}

export async function getProductRank(limit = 10) {
  return sql(
    "SELECT p.name AS product_name, SUM(o.quantity)::int AS total_quantity, SUM(o.total_price)::numeric::float AS total_sales FROM order_info o JOIN product p ON o.product_id = p.id GROUP BY o.product_id, p.name ORDER BY total_sales DESC LIMIT $1",
    [limit]
  ) as any;
}

export async function getProvinceDistribution() {
  return sql(
    "SELECT province AS name, COUNT(*)::int AS value FROM order_info GROUP BY province ORDER BY value DESC"
  ) as any;
}

export async function getOrderList(page = 1, size = 10, province?: string) {
  const offset = (page - 1) * size;
  let where = "";
  const params: (string | number)[] = [];
  if (province) {
    where = " WHERE o.province = $" + (params.length + 1);
    params.push(province);
  }
  const [countResult] = await sql("SELECT COUNT(*)::int AS total FROM order_info o" + where, params) as any;
  const total = countResult?.total ?? 0;
  const dataParams = [...params, size, offset];
  const records = await sql(
    "SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id" +
      where +
      " ORDER BY o.order_time DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2),
    dataParams
  ) as any;
  return { total, records, page, size };
}