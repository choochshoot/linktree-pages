document.addEventListener("DOMContentLoaded", function(){
  // =====================================
  // SUPABASE CONFIG
  // =====================================

  const SUPABASE_URL = "https://rkimkgdkzakflebplull.supabase.co"
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraW1rZ2RremFrZmxlYnBsdWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzg4OTksImV4cCI6MjA4ODkxNDg5OX0.NPXwTs9V0qxKxrJIh0ydlmEiHlfALGdJ0KrQwn6eIL0"

  const SUPABASE_ENDPOINT = `${SUPABASE_URL}/rest/v1/leads`


  const form = document.getElementById("leadForm")

  if(!form) return

  form.addEventListener("submit", function(e){

    e.preventDefault()

    // =====================================
    // RATE LIMIT (10 segundos)
    // =====================================

    const lastSubmit = localStorage.getItem("lead_submit_time")

    if(lastSubmit && Date.now() - lastSubmit < 10000){

      alert("Espera unos segundos antes de enviar nuevamente")

      return

    }

    localStorage.setItem("lead_submit_time", Date.now())

    const formData = new FormData(form)

    // =====================================
    // HONEYPOT CHECK
    // =====================================

    if(formData.get("website")){
      console.warn("Bot detectado")
      return
    }

    // =====================================
    // BUILD PAYLOAD
    // =====================================

    const payload = {
      slug: document.body.dataset.slug,
      name: formData.get("name"),
      whatsapp: formData.get("whatsapp"),
      email: formData.get("email") || null
    }

    console.log("Lead capturado:", payload)

    // =====================================
    // SEND TO SUPABASE
    // =====================================

    fetch(SUPABASE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if(!res.ok){
        throw new Error("Supabase insert error")
      }
      console.log("Lead guardado en Supabase")
    })
    .catch(err => {
      console.error("Error enviando lead:", err)
    })


    form.style.display = "none"

    const unlock = document.getElementById("vcardUnlock")

    unlock.style.display = "block"

    // mensaje para el usuario

    const message = document.createElement("p")

    message.textContent = "✔ Ahora guarda mi contacto en tu teléfono"

    message.style.marginTop = "16px"
    message.style.fontWeight = "600"
    message.style.color = "#16a34a"

    unlock.prepend(message)

    // forzar apertura del vCard

    const contactBtn = unlock.querySelector("a")

    contactBtn.addEventListener("click", function(e){

      e.preventDefault()

      window.location.href = this.getAttribute("href")

    })

    

  })

})