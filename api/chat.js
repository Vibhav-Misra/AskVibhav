export const runtime = "nodejs";          
export const dynamic = "force-dynamic";   

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'message' (string)" }), { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), { status: 500 });
    }

    const resumeData = `
Vibhav Misra is a data science graduate student at Pace University in New York City, expected to graduate in May 2026. He holds a Bachelor's degree in Computer Science with a specialization in Artificial Intelligence and Machine Learning from Chandigarh University.

Technical skills:
- Programming: Python, SQL, R, React, JavaScript
- MLOps & Experiment Tracking: MLflow, Model Registry, Experiment Tracking
- Cloud Platforms: AWS (S3, Lambda, EMR on EC2)
- ML & AI: Supervised & Unsupervised Learning, Neural Networks, Time Series Forecasting, Generative AI (OpenAI API)
- Data Science & Analytics Tools: Pandas, NumPy, Scikit-Learn, TensorFlow, Prophet, Keras, Jupyter Notebooks, Anaconda
- Big Data & Databases: MySQL, MongoDB, HBase, Neo4j, Hadoop (HDFS, MapReduce), Apache Spark
- Data Visualization: Power BI, Looker, Tableau, Matplotlib, Seaborn, Excel

Professional experience:
- Data Science Intern, EdMyst Inc. (Lewes, DE), Jun–Sep 2025
  - Designed/documented personalization for "Edy" AI coach; long-term user memory using MongoDB, S3, Lambda, LLM prompt injection
  - Built real-time video chunking + multipart S3 uploads with WebRTC/Node

Projects:
- Exoplanet Habitability Explorer (RF classifier, presets, compare tray)
- Real-Time NYC Subway Tracker (target: Sep 2025)
- BioML disease prediction (Flask + ML)
- Phishing website detection (Gradient Boosting)
- Amazon review rating forecasting (ARIMA, Prophet, LSTM)
- EV adoption analysis in Washington State
- Decision Tree vs Random Forest (hyperparameter study)

Certifications:
- Coursera: Mathematics for ML & DS (LA, Calculus, Prob/Stats)
- Coursera: NLP Specialization (Classification, Prob Models, Sequence, Attention)
- Coursera/IBM: Applied Data Science Specialization
Languages: English (fluent), Hindi (native)
`;

// api/chat.js  (Vercel serverless)
// Requires Node 20 on Vercel (see note below)

async function callGroq(model, prompt) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant who knows everything about Vibhav Misra's resume. Only use the resume content.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      // max_tokens: 512, // optional; add if you still see 400s about token limits
    }),
  });

  const text = await r.text(); // read once so we can log/show details
  let json;
  try { json = JSON.parse(text); } catch { /* leave as text */ }

  if (!r.ok) {
    const details = json?.error?.message || text?.slice(0, 800) || String(r.status);
    const err = new Error(`Groq ${r.status} – ${details}`);
    err.status = r.status;
    err.details = details;
    throw err;
  }

  return json?.choices?.[0]?.message?.content ?? "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string")
      return res.status(400).json({ error: "Missing 'message' (string)" });
    if (!process.env.GROQ_API_KEY)
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });

    const resumeData = `... your resume text ...`;

    const prompt = `
You are a chatbot trained on Vibhav Misra’s resume. Answer the following question based only on the information in the resume below.

Resume:
${resumeData}

Question: ${message}
`;

    // Try your preferred model first; on 400, fall back to a widely available alias.
    const preferred = "llama-3.3-70b-versatile";    // stronger, a bit slower
    const fallback  = "llama-3.1-8b-instant";       // fast, usually always available

    let reply;
    try {
      reply = await callGroq(preferred, prompt);
    } catch (e) {
      // Only fall back on "bad request" model issues
      if (e.status === 400 || /model/i.test(String(e.details))) {
        console.warn("Falling back to:", fallback, "because:", e.details);
        reply = await callGroq(fallback, prompt);
      } else {
        throw e;
      }
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Groq API error:", err?.message || err, "\nDetails:", err?.details || "");
    return res.status(502).json({
      error: "Groq API error",
      details: String(err?.message || err).slice(0, 1000),
    });
  }
}
