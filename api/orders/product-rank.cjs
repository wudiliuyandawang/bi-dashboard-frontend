const sql = require("../db.cjs");

module.exports = async function handler(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const rows = await sql(
      "SELECT p.name AS product_name, SUM(o.quantity)::int AS total_quantity, SUM(o.total_price)::numeric::float AS total_sales FROM order_info o JOIN product p ON o.product_id = p.id GROUP BY o.product_id, p.name ORDER BY total_sales DESC LIMIT $1",
      [limit]
    );
    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};