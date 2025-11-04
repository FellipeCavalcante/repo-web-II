export const logMiddleware = (req, res, next) => {
  const start = Date.now();

  const logPayload = { ...req.body };
  if (logPayload.password) logPayload.password = "***";
  if (logPayload.password2) logPayload.password2 = "***";
  if (logPayload.confirmPassword) logPayload.confirmPassword = "***";

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log({
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      url: req.url,
      payload: logPayload,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
    });
  });

  next();
};
