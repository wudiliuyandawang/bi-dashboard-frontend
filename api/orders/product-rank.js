export default function handler(req, res) {
  res.status(200).json([
    {"product_name":"MacBook Pro","total_quantity":2,"total_sales":25998.00},
    {"product_name":"iPhone 15","total_quantity":3,"total_sales":17997.00},
    {"product_name":"华为平板","total_quantity":2,"total_sales":6998.00},
    {"product_name":"显示器","total_quantity":2,"total_sales":3998.00},
    {"product_name":"Nike 跑鞋","total_quantity":3,"total_sales":2697.00},
    {"product_name":"蓝牙耳机","total_quantity":5,"total_sales":1495.00},
    {"product_name":"运动T恤","total_quantity":8,"total_sales":1192.00},
    {"product_name":"机械键盘","total_quantity":2,"total_sales":998.00},
    {"product_name":"双肩包","total_quantity":3,"total_sales":777.00},
    {"product_name":"充电宝","total_quantity":3,"total_sales":387.00}
  ]);
}