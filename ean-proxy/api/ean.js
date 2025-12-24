export default async function handler(req, res) {
  const { tipo, codigo } = req.query;

  if (!tipo || !codigo) {
    return res.status(400).send("Parâmetros inválidos");
  }

  const url = `http://www.eanpictures.com.br:9000/api/${tipo}/${codigo}`;

  try {
    const response = await fetch(url);
    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send("Erro no proxy");
  }
}
