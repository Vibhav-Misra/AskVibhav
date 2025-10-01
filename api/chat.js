const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message } = req.body;

  const resumeData = `
Vibhav Misra is a data science graduate student at Pace University in New York City, expected to graduate in May 2026. He holds a Bachelor's degree in Computer Science with a specialization in Artificial Intelligence and Machine Learning from Chandigarh University.

His technical skills are as follows
- Programming: Python, SQL, R, React, JavaScript
- MLOps & Experiment Tracking: MLflow, Model Registry, Experiment Tracking
- Cloud Platforms: AWS (S3, Lambda, EMR on EC2)
- ML & AI: Supervised & Unsupervised Learning, Neural Networks, Time Series Forecasting, Generative AI (OpenAI API)
- Data Science & Analytics Tools: Pandas, NumPy, Scikit-Learn, TensorFlow, Prophet, Keras, Jupyter Notebooks, Anaconda
- Big Data & Databases: MySQL, MongoDB, HBase, Neo4j, Hadoop (HDFS, MapReduce), Apache Spark
- Data Visualization: Power BI, Looker (dashboards, basic LookML modeling), Tableau, Matplotlib, Seaborn, Excel

His professional experiance is as follows 
- Worked at EdMyst Inc. Lewes, DE as a Data Science Intern from June 2025 till September 2025.
- Designed and documented a personalization system for an AI coaching platform (Edy), integrating onboarding data, session
performance, behavioral metrics, and feedback into a long-term user memory, with supporting architecture and data flows using
MongoDB, AWS S3, Lambda, and LLM prompt injection.
- Developed and tested a real-time video chunking and upload pipeline using WebRTC, Node.js, and AWS S3 multipart uploads,
enabling seamless video transfer and future analytics integration.

Vibhav has worked on multiple academic projects, including:
- An Exoplanet Habitability Explorer with a RF classifier, presets, details drawer, and compare tray.
- Real-Time NYC Subway Tracker (Expected Completion: September 2025) 
- A disease prediction app (BioML) using Flask and machine learning.
- A phishing website detection system using Gradient Boosting.
- Forecasting Amazon product review ratings using ARIMA, Prophet, and LSTM.
- Electric vehicle adoption analysis in Washington State.
- A comparative study of Decision Tree and Random Forest with hyperparameter tuning.

He completed a virtual data science internship with British Airways via Forage and holds certifications from IIT Madras, Coursera, and others in NLP, Data Science, and Mathematics.

He has the following certifications - 
- Mathematicsfor Machine Learning and Data Science Specialization (Linear Algebra for Machine Learning and Data Science, Calculus
for Machine Learning and Data Science, Probability & Statistics for Machine Learning & Data Science) from Coursera.
- Natural Language Processing Specialization (NLP with Classification and Vector Spaces, NLP with Probabilistic Models, NLP with
Sequence Models, NLP with Attention Models) from Coursera.
- Applied Data Science Specialization (Python for Data Science, AI & Development, Python Project for Data Science, Applied Data
Science Capstone, Data Visualization with Python, Data Analysis with Python) from Coursera. 

He is fluent in English and a native speaker of Hindi.
`;

  const prompt = `
You are a chatbot trained on Vibhav Misra’s resume. Answer the following question based only on the information in the resume below.

Resume:
${resumeData}

Question: ${message}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant who knows everything about Vibhav Misra's resume." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error response:", errorText);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("Groq response:", data);

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't come up with a response.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Groq API error:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch response from Groq." });
  }
};

