
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
Eres un psicólogo clínico experto en DSM-5 y CIE-10.
Recibirás la información de una consulta psicológica y deberás analizarla y responder SOLO en JSON válido.

DATOS CLÍNICOS:
${JSON.stringify(clinicalData, null, 2)}

FORMATO DE RESPUESTA (JSON ESTRICTO):

{
  "diagnosis": {
    "name": "Nombre del trastorno principal",
    "icd10": "Código CIE10 o DSM",
    "confidence": 0
  },
  "differential_diagnoses": [
    {
      "name": "Diagnóstico diferencial 1",
      "icd10": "Código",
      "confidence": 0
    }
  ],
  "explanation": "Explicación breve y clara en lenguaje profesional.",
  "recommendations": [
    "Recomendación 1",
    "Recomendación 2"
  ],
  "factors": [
    {
      "feature": "Factor relevante (p.ej. duración de síntomas)",
      "value": "Descripción breve"
    }
  ],
  "alerts": [
    {
      "level": "critical | warning | info",
      "title": "Título de la alerta clínica",
      "message": "Descripción breve de la alerta."
    }
  ]
}

NO INCLUYAS ningún texto fuera del JSON.
`;

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENROUTER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2b-it:free",
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
