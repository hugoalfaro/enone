//test
// api/diagnose.js
// Función serverless para Vercel: recibe clinicalData, llama a OpenRouter y devuelve un JSON estructurado.
 
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "YACHAY diagnose API OK. Use POST." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

  if (!OPENROUTER_KEY) {
    return res.status(500).json({ error: "Missing OPENROUTER_KEY in environment variables" });
  }

  try {
    const { clinicalData } = req.body || {};

const prompt = `
Eres un psicólogo clínico. Responde SOLO en JSON válido y sin texto adicional.

DATOS:
${JSON.stringify(form)}

FORMATO:
{
  "diagnosis": "",
  "differential": [],
  "explanation": "",
  "recommendations": [],
  "alerts": []
}
`;

   console.log("PROMPT ENVIADO A IA ========\n", prompt, "\n====== FIN DEL PROMPT =======");

   
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENROUTER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await apiResponse.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Si falla el parse, lo dejamos en null y devolvemos el texto bruto para debug
    }
console.log("RAW FROM LLAMA:", raw);
    return res.status(200).json({
      ok: true,
      parsed,
      rawText: raw
    });
  } catch (error) {
    console.error("Error en diagnose API:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message
    });
  }
}
