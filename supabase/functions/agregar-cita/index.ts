import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function crearJWT(clientEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const unsignedToken = `${encode(header)}.${encode(payload)}`

  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${unsignedToken}.${signatureB64}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fecha, hora, tecnico, observaciones, usuarioEmail, usuarioNombre } = await req.json()

    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')!
    const privateKey  = Deno.env.get('GOOGLE_PRIVATE_KEY')!.replace(/\\n/g, '\n')
    const calendarId  = Deno.env.get('GOOGLE_CALENDAR_ID')!

    const jwt = await crearJWT(clientEmail, privateKey)

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })
    const { access_token } = await tokenRes.json()

    const parseHora = (h: string) => {
      const [time, period] = h.split(' ')
      let [hh, mm] = time.split(':').map(Number)
      if (period === 'PM' && hh !== 12) hh += 12
      if (period === 'AM' && hh === 12) hh = 0
      return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:00`
    }

    const horaInicio = parseHora(hora)
    const horaFin    = `${(parseInt(horaInicio) + 1).toString().padStart(2, '0')}:${horaInicio.slice(3)}`

    const evento = {
      summary: `🏍️ Cita MOTO PRO — ${usuarioNombre}`,
      description: `Cliente: ${usuarioNombre}\nCorreo: ${usuarioEmail}\nTécnico: ${tecnico}\nObservaciones: ${observaciones || 'Ninguna'}`,
      start: { dateTime: `${fecha}T${horaInicio}`, timeZone: 'America/Bogota' },
      end:   { dateTime: `${fecha}T${horaFin}`,    timeZone: 'America/Bogota' },
      colorId: '11',
    }

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(evento),
      }
    )

    const calData = await calRes.json()

    return new Response(
      JSON.stringify({ success: true, eventId: calData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
