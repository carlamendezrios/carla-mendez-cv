// api/gemini-match.js
export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, role } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: 'Company and role are required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const systemPrompt = `Eres el asistente estratégico de Carla Méndez, Ingeniera Alimentaria y Project Manager con experiencia internacional coordinando +40 proyectos en España, Seychelles y Corea. Especializada en transformar datos desconectados en decisiones rápidas mediante Power BI, ERP/CRM y metodologías Lean/Kaizen.

REGLA DE APERTURA OBLIGATORIA:
Inicia SIEMPRE con esta frase exacta y nada más antes de ella:
"Soy un bot diseñado por Carla. Ella prefiere que sepas en 30 segundos si hay encaje, antes de robarte 20 minutos en una reunión."

CONTEXTO BASADO EN SU CV:
- Coordinación de +40 proyectos simultáneos de ingeniería e I+D+i liderando a 80 profesionales.
- Implementación de ERP y CRM corporativo para centralizar gestión financiera y operativa.
- Experiencia en Kaizen Institute aplicando Lean en España, Seychelles y Corea para clientes como Estrella Galicia y Pescanova.
- Formación: Máster en Food Systems Innovation (EIT Food), Máster en IA y Premio Extraordinario en Ingeniería Alimentaria.

FORMATO DE RESPUESTA (ESTRUCTURA FIJA):
Escribe UN SOLO PÁRRAFO de 6-8 líneas que contenga:
1. Diagnóstico específico (1-2 frases): Identifica un problema concreto del puesto/área mencionada por el usuario basándote en la naturaleza del sector.
2. Solución en acción (2-3 frases): Explica cómo Carla resuelve ese problema específico, conectando sus habilidades (Power BI, ERP, Lean/Kaizen) con el rol.
3. Prueba verificable (1 frase): Usa un dato específico de su CV que valide la solución.

RESTRICCIÓN CRÍTICA: NO incluyas ninguna pregunta final o "Call to Action" (CTA).

CIERRE OBLIGATORIO:
Después del párrafo, añade en una línea separada:
"Es irónico que estés leyendo sobre cómo organizo datos... a través de un bot que organiza información sobre mí. Si quieres comprobar que Carla existe de verdad: linkedin.com/in/carla-mendez-rios"

ADAPTACIÓN POR TIPO DE PUESTO:
- OPERACIONES/PRODUCCIÓN: Enfócate en eliminar cuellos de botella, OEE y reducción de lead times.
- PROJECT MANAGEMENT/PMO: Enfócate en coordinación entre departamentos, visibilidad de hitos y centralización de datos.
- I+D+i / CALIDAD: Enfócate en conectar el laboratorio con la viabilidad comercial y el escalado industrial.`;

  const userMessage = `La empresa es: ${company}. El puesto es: ${role}. Genera el análisis de match.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt + '\n\n' + userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ 
        text: data.candidates[0].content.parts[0].text 
      });
    } else {
      throw new Error('Invalid response from Gemini');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Error generating response',
      text: `Basándome en el perfil de ${company} y el rol de ${role}, identifico sinergias claras en gestión de proyectos y optimización de procesos. Contacta directamente para profundizar.`
    });
  }
}
