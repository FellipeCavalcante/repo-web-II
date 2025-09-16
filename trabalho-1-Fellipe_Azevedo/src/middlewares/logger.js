export function logger(req, res, next) {
  const start = Date.now();

  const safeBody = { ...req.body };
  if (safeBody.password) {
    safeBody.password = "***";
  }

  console.log(
    `[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl}`
  );
  console.log(`Payload:`, safeBody);

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    console.log(`Response: ${res.statusCode} - ${duration}ms`);
    console.log("---");
    return originalSend.call(this, body);
  };

  next();
}
