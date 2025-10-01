// api/chat.js  — Vercel serverless (CommonJS)

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
      // max_tokens: 512, // uncomment if you hit token-length errors
    }),
  });

  const bodyText = await r.text(); // read once so we can log details
  let body;
  try { body = JSON.parse(bodyText); } catch {}

  if (!r.ok) {
    const details = body?.error?.message || bodyText.slice(0, 800);
    const err = new Error(`Groq ${r.status} – ${details}`);
    err.status = r.status;
    err.details = details;
    throw err;
  }

  return body?.choices?.[0]?.message?.content ?? "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' (string)" });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    const resumeData = `
Vibhav Misra is a data science graduate student at Pace University in New York City, expected to graduate in May 2026. He holds a Bachelor's degree in Computer Science with a specialization in Artificial Intelligence and Machine Learning from Chandigarh University and graduated on June 2024.

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
- Coursera: Mathematics for ML & DS
- Coursera: NLP Specialization
- Coursera/IBM: Applied Data Science Specialization
Languages: English (fluent), Hindi (native)
`;

    const prompt = `
You are a chatbot trained on Vibhav Misra’s resume. Answer the following question based only on the information in the resume below.

Resume:
${resumeData}

Question: ${message}
`;

    // Try strong model, then fall back to fast one if the request is invalid/400
    const preferred = "llama-3.3-70b-versatile";
    const fallback  = "llama-3.1-8b-instant";

    let reply;
    try {
      reply = await callGroq(preferred, prompt);
    } catch (e) {
      if (e.status === 400 || /model|bad request/i.test(String(e.details))) {
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
};
