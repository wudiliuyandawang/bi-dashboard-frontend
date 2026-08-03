const sql = require("../db.cjs");

module.exports = async function handler(req, res) {
  try {
    const rows = await sql(
      "SELECT province AS name, COUNT(*)::int AS value FROM order_info GROUP BY province ORDER BY value DESC"
    );
    res.status(200).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};