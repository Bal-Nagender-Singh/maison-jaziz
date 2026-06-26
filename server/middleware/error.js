export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Image must be 8 MB or smaller' });
  if (err.code === 'P2002') return res.status(409).json({ message: `A record with that ${err.meta?.target?.join(', ') || 'value'} already exists` });
  const status = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(status).json({ message: status === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : err.message || 'Server error', stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
};
