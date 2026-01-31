export default async function handler(req, res) {
  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // Tu prompt estratégico aquí
  const systemInstruction = `Eres el asistente estratégico de Carla Méndez... [TU PROMPT COMPLETO]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemInstruction}\n\nEmpresa: ${company}, Puesto: ${role}` }] }]
      })
    });

    const data = await response.json();
    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el análisis.";
    
    // Devolvemos el JSON con la propiedad "text"
    res.status(200).json({ text: cleanText }); 
  } catch (error) {
    res.status(500).json({ error: 'Error de servidor' });
  }
}
