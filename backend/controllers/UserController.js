const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { validarRegistroUsuario, validarLogin } = require("../utils/validations");

async function registerUser(req, res) {
  const { email, username, password } = req.body;

  const erros = validarRegistroUsuario({ email, username, password });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        username: username.trim(),
        password: hashedPassword,
      },
    });

    // Nunca devolvemos o hash da senha na resposta.
    const { password: _senha, ...usuarioSemSenha } = user;

    res.status(201).json({ message: "User registered successfully", user: usuarioSemSenha });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "E-mail ou usuário já cadastrado." });
    }
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
}

// Login de usuário
async function doLogin(req, res) {
  const { username, password } = req.body;

  const erros = validarLogin({ username, password });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro ao efetuar login." });
  }
}

module.exports = {
  registerUser,
  doLogin,
};
