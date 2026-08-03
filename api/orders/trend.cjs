const sql = require("../db.cjs");

module.exports = async function handler(req, res) {
  try {
    const days = parseInt(req.query.days) || 7;
    const rows = await sql(
      "SELECT order_time::date AS date, COALESCE(SUM(total_price), 0)::float AS amount FROM order_info WHERE order_time >= CURRENT_DATE - $1::int GROUP BY order_time::date ORDER BY date ASC",
      [days]
    );
    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};