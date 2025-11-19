import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors({
 origin: [
    "https://darwinortegaderecholaboral.com",
    "https://legaltech-assistant.onrender.com",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Configurar rutasSTATIC para servir chat.html
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === ROUTE AI LEGAL CHAT === //
app.post("/api/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          "role": "system",
          "content": [
            {
              "type": "input_text",
              "text":
              "Formato de respuesta obligatorio:\n\n1️⃣ Cita textual del artículo solicitado:\n- Entre comillas\n- Manteniendo exactamente el texto del documento cargado\n- Sin unir párrafos distintos del mismo artículo\n- Si el artículo tiene numerales o incisos, solo citar los aplicables a la pregunta\n\n2️⃣ Explicación jurídica:\n- En un párrafo separado\n- Explicar alcance, efecto práctico y relación con el Derecho Laboral o Constitucional\n- Máximo 150 palabras\n\n3️⃣ Separación visual:\n- Usar salto de línea entre la cita y la explicación\n- No juntar todo en un solo bloque\n\nModelo de ejemplo:\n\n“Texto exacto del artículo…”\n\n📌 Explicación jurídica:\n[Análisis, alcance, efectos]\n\n---\n\nReglas adicionales:\n- Si se pide un número de artículo, responder únicamente ese artículo\n- Si hay varias versiones del artículo, citar la versión vigente\n- Si el artículo no está en tus fuentes, decirlo sin inventar nada\n"
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "input_text",
              "text": userMessage
            }
          ]
        }
      ],
      text: {
        "format": {
          "type": "text"
        }
      },
      tools: [
        {
          "type": "file_search",
          "vector_store_ids": [
            process.env.VECTOR_STORE_ID
          ]
        }
      ],
      max_output_tokens: 2048,
      temperature: 0.3
    });

    res.json({ reply: response.output_text });

  } catch (error) {
    console.error("❌ ERROR en OpenAI:", error);
    res.status(500).json({ error: "Error generando respuesta" });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`⚖️ LegalTech Server running on port ${port}`)
);
