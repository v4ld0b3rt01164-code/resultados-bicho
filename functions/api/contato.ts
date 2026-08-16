interface Env {
  RESEND_API_KEY?: string;
}

interface ContatoBody {
  nome: string;
  email: string;
  mensagem: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;

  if (request.method !== 'POST') {
    return jsonResponse({ erro: 'Método não permitido' }, 405);
  }

  try {
    const body: ContatoBody = await request.json();

    if (!body.nome || !body.email || !body.mensagem) {
      return jsonResponse(
        { erro: 'Nome, email e mensagem são obrigatórios' },
        400
      );
    }

    const nome = escapeHtml(body.nome);
    const email = escapeHtml(body.email);
    const mensagem = escapeHtml(body.mensagem);

    const apiKey = context.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('ERRO: RESEND_API_KEY não configurada');
      return jsonResponse({ erro: 'Serviço de email não configurado' }, 500);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Contato ResultadosBicho <contato@resultadosbicho.online>',
        to: 'loteriabronline@gmail.com',
        reply_to: body.email,
        subject: `Novo contato de ${nome}`,
        html: `
          <h2>Novo contato via site</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${mensagem.replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', res.status, errText);
      return jsonResponse({ erro: 'Erro ao enviar email' }, 500);
    }

    await res.json();
    return jsonResponse({ message: 'Mensagem enviada com sucesso!' }, 200);
  } catch (e) {
    console.error('Contato error:', e);
    return jsonResponse({ erro: 'Erro interno do servidor' }, 500);
  }
};