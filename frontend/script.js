document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      
      const result = await response.json();
  
      if (response.ok) {
        document.getElementById("message").textContent = result.message;
        document.getElementById("message").style.color = "green";
      } else {
        document.getElementById("message").textContent = result.message || "Erro no registro";
        document.getElementById("message").style.color = "red";
      }
    } catch (error) {
      document.getElementById("message").textContent = "Erro de conexão com o servidor";
      document.getElementById("message").style.color = "red";
    }
  });