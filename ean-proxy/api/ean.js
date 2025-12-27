export default async function handler(req, res) {
  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // =================

  // Only allow GET method for actual requests
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const { tipo, codigo } = req.query;

  // Validate required parameters
  if (!codigo) {
    return res.status(400).json({ error: "Código não informado" });
  }

  if (!tipo || (tipo !== "descricao" && tipo !== "gtin")) {
    return res.status(400).json({ error: "Tipo inválido. Use 'descricao' ou 'gtin'" });
  }

  let url;
  if (tipo === "descricao") {
    url = `http://www.eanpictures.com.br:9000/api/descricao/${codigo}`;
  } else {
    url = `http://www.eanpictures.com.br:9000/api/gtin/${codigo}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Vercel-Proxy/1.0'
      },
      timeout: 10000 // 10 seconds timeout
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 404) {
        return res.status(404).json({ error: "Produto não encontrado" });
      } else {
        return res.status(502).json({ 
          error: `API externa retornou erro ${status}` 
        });
      }
    }

    // Get response as text first to check content
    const textData = await response.text();
    
    if (!textData || textData.trim() === "") {
      return res.status(404).json({ error: "Sem dados disponíveis" });
    }

    // Try to parse as JSON, but fallback to text if needed
    try {
      const jsonData = JSON.parse(textData);
      return res.status(200).json(jsonData);
    } catch (parseError) {
      // If it's not JSON, return as plain text
      return res.status(200).send(textData);
    }

  } catch (err) {
    console.error("Erro na API proxy:", err);
    
    // More specific error messages
    if (err.name === 'TimeoutError' || err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: "Timeout na API externa" });
    }
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(502).json({ error: "API externa indisponível" });
    }
    
    return res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
