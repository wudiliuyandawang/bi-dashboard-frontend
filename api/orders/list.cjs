const sql = require("../db.cjs");

module.exports = async function handler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const province = req.query.province;
    const offset = (page - 1) * size;

    let where = "";
    const params = [];

    if (province) {
      where = " WHERE o.province = $1";
      params.push(province);
    }

    const [countResult] = await sql(
      "SELECT COUNT(*)::int AS total FROM order_info o" + where,
      params
    );
    const total = countResult?.total ?? 0;

    const dataParams = [...params, size, offset];
    const records = await sql(
      "SELECT o.id, o.user_id, o.product_id, p.name AS product_name, o.quantity, o.total_price, o.province, o.order_time FROM order_info o JOIN product p ON o.product_id = p.id" +
        where +
        " ORDER BY o.order_time DESC LIMIT $" +
        (params.length + 1) +
        " OFFSET $" +
        (params.length + 2),
      dataParams
    );

    res.status(200).json({ total, records, page, size });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};