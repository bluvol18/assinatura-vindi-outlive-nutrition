const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

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
    console.log('Customer data:', customerData);

    const customerId = customerData.customer?.id;
    if (!customerId) throw new Error("Erro ao criar cliente");

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

    const subscriptionData = await subscriptionRes.json();
    console.log('Subscription data:', subscriptionData);

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
    console.log('Token data:', tokenData);

    if (tokenData.payment_profile_token && tokenData.payment_profile_token.url) {
      res.json({ redirect_url: tokenData.payment_profile_token.url });
    } else {
      res.status(500).json({ error: 'Erro ao gerar link de pagamento' });
    }

  } catch (error) {
    console.error('Erro no backend:', error);
    res.status(500).json({ error: 'Erro na criação da assinatura' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
