export default async function handler(req, res) {
  const { tipo, codigo } = req.query;

  if (!codigo) {
    return res.status(400).send("Código não informado");
  }

  let url;

  if (tipo === "descricao") {
    url = `http://www.eanpictures.com.br:9000/api/descricao/${codigo}`;
  } else if (tipo === "gtin") {
    url = `http://www.eanpictures.com.br:9000/api/gtin/${codigo}`;
  } else {
    return res.status(400).send("Tipo inválido");
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(404).send("Produto não encontrado");
    }

    const data = await response.text();

    // evita resposta vazia
    if (!data || data.trim() === "") {
      return res.status(404).send("Sem dados");
    }

    return res.status(200).send(data);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro ao consultar API externa");
  }
}
