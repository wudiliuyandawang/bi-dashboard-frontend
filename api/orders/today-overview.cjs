const sql = require("../db.cjs");

module.exports = async function handler(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [sales, orders, users] = await Promise.all([
      sql("SELECT COALESCE(SUM(total_price), 0)::float AS total_sales FROM order_info WHERE order_time::date = $1", [today]),
      sql("SELECT COUNT(*)::int AS total_orders FROM order_info WHERE order_time::date = $1", [today]),
      sql("SELECT COUNT(*)::int AS new_users FROM users WHERE create_time::date = $1", [today]),
    ]);
    res.status(200).json({
      totalSales: sales[0]?.total_sales ?? 0,
      totalOrders: orders[0]?.total_orders ?? 0,
      newUsers: users[0]?.new_users ?? 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};