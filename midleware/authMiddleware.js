const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ mensaje: "Token inválido" });
    }
    
    console.log("✅ Token decodificado:", user); // 👀 Ver el contenido del token

    // ✅ Ahora `req.user` incluye el rol
    req.user = { id: user.id, rol: user.rol };
    next();
  });
};

module.exports = authenticateToken;
