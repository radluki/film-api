export const healthckeckController = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
};