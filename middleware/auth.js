const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(403).send('Token requerido');

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).send('Token no encontrado');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Token inválido');
    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
