export default function handler(req, res) {
  res.status(200).json([
    {"name":"广东","value":6},{"name":"上海","value":3},{"name":"北京","value":3},
    {"name":"浙江","value":3},{"name":"湖北","value":2},{"name":"四川","value":2},{"name":"江苏","value":2}
  ]);
}