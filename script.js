async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const userText = inputField.value.trim();
    if (!userText) return;
  
    const chatbox = document.getElementById('chatbox');
  
    chatbox.innerHTML += `<p class="user">${userText}</p>`;
    inputField.value = '';
    chatbox.scrollTop = chatbox.scrollHeight;
  
    const response = await fetch('https://your-vercel-or-api-url.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });
  
    const data = await response.json();
  
    chatbox.innerHTML += `<p class="bot">${data.reply}</p>`;
    chatbox.scrollTop = chatbox.scrollHeight;
  }
  