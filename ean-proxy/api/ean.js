export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { tipo, codigo } = req.query;

  if (!codigo || !/^\d{8,14}$/.test(codigo)) {
    return res.status(200).send("");
  }

  try {
    const response = await fetch(
      `https://pt.product-search.net/?q=${codigo}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "pt-BR,pt;q=0.9"
        }
      }
    );

    const html = await response.text();

    let descricao = "";

    // extração robusta
    const match =
      html.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
      html.match(/<title>(.*?)<\/title>/i);

    if (match) {
      descricao = match[1]
        .replace(/\s+-\s+Product Search.*/i, "")
        .replace(/<[^>]+>/g, "")
        .trim();
    }

    if (!descricao) {
      descricao = "Produto não identificado";
    }

    if (tipo === "descricao") {
      return res.status(200).send(descricao);
    }

    if (tipo === "gtin") {
      return res.status(200).send(codigo);
    }

    return res.status(200).send("");

  } catch (err) {
    console.error("EAN proxy error:", err);
    return res.status(200).send("Produto não identificado");
  }
}

