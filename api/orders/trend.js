function pad(n) { return n < 10 ? '0' + n : '' + n; }
const now = new Date();
const data = [];
for (let i = 29; i >= 0; i--) {
  const d = new Date(now.getTime() - i * 86400000);
  data.push({
    date: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
    revenue: Math.round((Math.random() * 80000 + 60000) * 100) / 100,
    orders: Math.floor(Math.random() * 200 + 100)
  });
}
export default function handler(req, res) {
  res.status(200).json(data);
}