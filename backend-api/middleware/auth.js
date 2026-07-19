const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Check for Token in headers
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso negado. Token de autenticação não fornecido.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_padrao_secreta');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Sessão expirada ou Token inválido.'
    });
  }
};
