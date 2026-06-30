document.addEventListener("DOMContentLoaded", () => {
  const configEl = document.getElementById("pet-admin-config")
  if (!configEl) return

  const config = JSON.parse(configEl.textContent)
  const slug = config.slug
  const supabaseUrl = config.supabase.url.replace(/\/$/, "")
  const supabaseKey = config.supabase.anon_key
  const headers = {
    "Content-Type": "application/json",
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
  }

  const loginForm = document.querySelector("[data-login-form]")
  const profileForm = document.querySelector("[data-profile-form]")
  const workspace = document.querySelector("[data-workspace]")
  const authPanel = document.querySelector("[data-auth-panel]")
  const status = document.querySelector("[data-status]")
  const saveVaccinesButton = document.querySelector("[data-save-vaccines]")
  let ownerPassword = ""

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault()
    const formData = new FormData(loginForm)
    ownerPassword = String(formData.get("password") || "")
    setStatus("Validando acceso...")

    try {
      const isValid = await rpc("verify_pet_owner_password", {
        p_slug: slug,
        p_password: ownerPassword,
      })

      if (!isValid) {
        ownerPassword = ""
        setStatus("Password incorrecto.")
        return
      }

      const state = await rpc("get_pet_owner_edit_state", {
        p_slug: slug,
        p_password: ownerPassword,
      })

      fillState(state || {})
      authPanel.hidden = true
      workspace.hidden = false
      setStatus("")
    } catch (error) {
      console.error(error)
      ownerPassword = ""
      setStatus("No se pudo validar el acceso.")
    }
  })

  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault()
    const formData = new FormData(profileForm)
    setStatus("Guardando datos...")

    try {
      await rpc("update_pet_profile_by_password", {
        p_slug: slug,
        p_password: ownerPassword,
        p_birth_date: valueOrNull(formData.get("birth_date")),
        p_color: valueOrNull(formData.get("color")),
        p_weight_kg: numberOrNull(formData.get("weight_kg")),
        p_microchip: valueOrNull(formData.get("microchip")),
        p_owner_name: valueOrNull(formData.get("owner_name")),
        p_whatsapp_phone: valueOrNull(formData.get("whatsapp_phone")),
        p_telegram_chat_id: valueOrNull(formData.get("telegram_chat_id")),
        p_telegram_enabled: formData.get("telegram_enabled") === "on",
        p_timezone: valueOrNull(formData.get("timezone")) || "America/Mexico_City",
      })
      setStatus("Datos guardados.")
    } catch (error) {
      console.error(error)
      setStatus("No se pudieron guardar los datos.")
    }
  })

  saveVaccinesButton?.addEventListener("click", async () => {
    const forms = document.querySelectorAll("[data-vaccine-form]")
    setStatus("Guardando vacunas...")

    try {
      for (const form of forms) {
        const formData = new FormData(form)
        const vaccineName = valueOrNull(formData.get("vaccine_name"))
        if (!vaccineName) continue

        await rpc("upsert_pet_vaccination_by_password", {
          p_slug: slug,
          p_password: ownerPassword,
          p_vaccine_name: vaccineName,
          p_administered_on: valueOrNull(formData.get("administered_on")),
          p_next_due_on: valueOrNull(formData.get("next_due_on")),
          p_veterinarian_name: valueOrNull(formData.get("veterinarian_name")),
          p_clinic_name: valueOrNull(formData.get("clinic_name")),
          p_lot_number: valueOrNull(formData.get("lot_number")),
          p_private_notes: valueOrNull(formData.get("private_notes")),
          p_is_public: formData.get("is_public") === "on",
        })
      }
      setStatus("Vacunas guardadas.")
    } catch (error) {
      console.error(error)
      setStatus("No se pudieron guardar las vacunas.")
    }
  })

  async function rpc(name, payload) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  }

  function fillState(state) {
    fillForm(profileForm, state.profile || {})
    fillForm(profileForm, state.contact || {})
    if (state.contact?.telegram_enabled) {
      const checkbox = profileForm.querySelector('[name="telegram_enabled"]')
      if (checkbox) checkbox.checked = true
    }

    const vaccines = new Map((state.vaccinations || []).map((item) => [String(item.vaccine_name || "").toLowerCase(), item]))
    document.querySelectorAll("[data-vaccine-form]").forEach((form) => {
      const name = form.querySelector('[name="vaccine_name"]')?.value || ""
      const item = vaccines.get(name.toLowerCase())
      if (item) fillForm(form, item)
      const publicCheckbox = form.querySelector('[name="is_public"]')
      if (publicCheckbox) publicCheckbox.checked = item?.is_public !== false
    })
  }

  function fillForm(form, data) {
    if (!form) return
    for (const [key, value] of Object.entries(data)) {
      const field = form.querySelector(`[name="${key}"]`)
      if (!field || value === null || value === undefined) continue
      if (field.type === "checkbox") {
        field.checked = Boolean(value)
      } else {
        field.value = value
      }
    }
  }

  function setStatus(message) {
    if (status) status.textContent = message
  }

  function valueOrNull(value) {
    const clean = String(value || "").trim()
    return clean || null
  }

  function numberOrNull(value) {
    const clean = valueOrNull(value)
    return clean === null ? null : Number(clean)
  }
})
