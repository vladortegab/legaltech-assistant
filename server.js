import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors({
 origin: [
    "https://darwinortegaderecholaboral.com", 
    "https://legaltech-assistant.onrender.com"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

// 🚀 Ruta principal del chat
app.post("/api/chat", async (req, res) => {
  try {
    const { userMessage, thread_id } = req.body;

    let threadId = thread_id;

    // Si no hay thread anterior, crea uno nuevo por usuario
    if (!threadId) {
      const newThread = await client.beta.threads.create();
      threadId = newThread.id;
    }

    // Agregar mensaje del usuario al thread
    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    // Ejecutar Assistant con File Search
    const run = await client.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    // Obtener mensajes del thread
    const messages = await client.beta.threads.messages.list(threadId);
    const responseMsg = messages.data[0].content[0].text.value;

    return res.json({
      reply: responseMsg,
      thread_id: threadId,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: "Error al procesar solicitud" });
  }
});


// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Servidor legaltech en http://localhost:${port}`)
);
