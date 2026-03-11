document.addEventListener("DOMContentLoaded", function(){

  const form = document.getElementById("leadForm")

  if(!form) return

  form.addEventListener("submit", function(e){

    e.preventDefault()

    const formData = new FormData(form)

    const payload = {
      name: formData.get("name"),
      whatsapp: formData.get("whatsapp"),
      email: formData.get("email") || null
    }

    console.log("Lead capturado:", payload)

    form.style.display = "none"

    const unlock = document.getElementById("vcardUnlock")

    unlock.style.display = "block"

    setTimeout(() => {

      unlock.querySelector("a").click()

    }, 500)

  })

})