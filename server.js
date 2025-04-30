const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

const API_KEY_BASE64 = process.env.API_KEY_BASE64;

app.post('/vindi/assinatura', async (req, res) => {
  try {
    const { name, email, phone, cpf, plan_id } = req.body;

    const customerRes = await fetch('https://app.vindi.com.br/api/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + API_KEY_BASE64,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: {
          name,
          email,
          registry_code: cpf,
          contacts: [{ name, email, phone }]
        }
      })
    });

    const customerData = await customerRes.json();
    const customerId = customerData.customer.id;

    const subscriptionRes = await fetch('https://app.vindi.com.br/api/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + API_KEY_BASE64,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: {
          plan_id: parseInt(plan_id),
          customer_id: customerId
        }
      })
    });

    const tokenRes = await fetch('https://app.vindi.com.br/api/v1/payment_profile_tokens', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + API_KEY_BASE64,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_profile_token: {
          customer_id: customerId,
          success_url: "https://SEUSITE.com/assinatura/sucesso",
          error_url: "https://SEUSITE.com/assinatura/erro"
        }
      })
    });

    const tokenData = await tokenRes.json();
    res.json({ redirect_url: tokenData.payment_profile_token.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro na criação da assinatura' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
