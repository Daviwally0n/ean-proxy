export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  // Lê usuários do ambiente (Vercel)
  const users = JSON.parse(process.env.USERS_JSON || "[]");

  const autorizado = users.find(
    u => u.user === user && u.pass === pass
  );

  if (!autorizado) {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  // Token simples
  const token = Buffer.from(
    `${user}:${Date.now()}`
  ).toString("base64");

  return res.status(200).json({
    ok: true,
    usuario: user,
    token
  });
}

