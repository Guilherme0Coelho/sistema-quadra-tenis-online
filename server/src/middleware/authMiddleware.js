// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (req.user.role !== 'admin') {
       return res.status(403).json({ message: 'Acesso proibido. Permissões insuficientes.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = authMiddleware;