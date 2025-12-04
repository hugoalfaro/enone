// api/diagnose.js

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
    // 🟩 CAPTURO LOS DATOS DEL FRONTEND
    const form = req.body?.clinicalData || req.body;

    // 🟩 PROMPT COMPACTO (compatible con Llama Free)
    
const prompt = `
Eres un psicólogo clínico experto en DSM-5 y CIE-10.
Responde SIEMPRE en español, SOLO con un JSON válido.
Debes completar TODOS los campos del JSON. Ningún campo puede quedar vacío.

DATOS CLÍNICOS:
${JSON.stringify(clinicalData)}

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
  "explanation": "Explicación breve del fundamento clínico.",
  "recommendations": [
    "Debe contener al menos dos recomendaciones clínicas específicas basadas en los síntomas.",
    "Otra recomendación clínica obligatoria."
  ],
  "factors": [
    {
      "feature": "Factor relevante identificado",
      "value": "Descripción breve"
    }
  ],
  "alerts": [
    {
      "level": "critical | warning | info",
      "title": "Título de la alerta clínica",
      "message": "Descripción de la alerta."
    }
  ]
}

NO INCLUYAS ningún texto fuera del JSON.
`;


    console.log("PROMPT ENVIADO A IA ========\n", prompt, "\n====== FIN DEL PROMPT =======");

    // 🟩 LLAMADA A OPENROUTER
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENROUTER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-tiny",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await apiResponse.json();
    console.log("OPENROUTER RAW RESPONSE:", data); // 👈 AÑADE ESTA LÍNEA
    const raw = data?.choices?.[0]?.message?.content || "{}";

    // Intentamos parsear el JSON de Llama
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn("⚠️ Llama devolvió algo que no es JSON limpio");
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

