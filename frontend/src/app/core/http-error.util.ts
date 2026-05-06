/** Extrae mensaje de error de respuestas HttpClient (JSON o texto). */
export function httpErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const e = err as { error?: unknown; message?: string };
  const body = e.error;
  let msg = fallback;

  if (body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string') {
    msg = (body as { error: string }).error;
  } else if (typeof body === 'string' && body.length > 0) {
    try {
      const j = JSON.parse(body) as { error?: string };
      msg = j.error ?? body;
    } catch {
      msg = body;
    }
  } else if (typeof e.message === 'string' && e.message.length > 0) {
    msg = e.message;
  }

  return mapKnownApiErrors(msg);
}

/** Mensajes amigables en español para respuestas conocidas del backend. */
function mapKnownApiErrors(msg: string): string {
  const m: Record<string, string> = {
    'Username already exists': 'Este usuario ya está registrado. Prueba con otro nombre o inicia sesión.',
    'Invalid credentials': 'Usuario o contraseña incorrectos.',
    'Insufficient role for this action (admin required).': 'No tienes permiso de administrador para esta acción.'
  };
  return m[msg] ?? msg;
}
