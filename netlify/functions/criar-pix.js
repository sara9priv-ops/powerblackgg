exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { valor, descricao, pedidoId, comprador } = JSON.parse(event.body);

  const response = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "X-Idempotency-Key": String(pedidoId)
    },
    body: JSON.stringify({
      transaction_amount: valor,
      description: descricao,
      payment_method_id: "pix",
      payer: {
        email: comprador.email || "cliente@powerblackgg.com",
        first_name: comprador.nome || "Cliente"
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: data.message || "Erro ao gerar PIX" })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64,
      qrCodeText: data.point_of_interaction.transaction_data.qr_code,
      paymentId: data.id
    })
  };
};
