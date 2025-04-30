const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const JWT_SECRET = process.env.JWT_SECRET;
const PAGINA_URL = 'https://app.vindi.com.br/customer/pages/324cf5c3-89b8-48a8-8317-3a02db4c50aa/subscriptions/new';

app.post('/vindi/assinatura', async (req, res) => {
  try {
    const { name, email, phone, cpf } = req.body;

    const payload = {
      customer: {
        name: name?.trim() || 'Cliente Shopify',
        email,
        registry_code: cpf,
        contacts: [
          {
            name: `Contato de ${name}`,
            email,
            phone
          }
        ]
      }
    };

    const token = jwt.sign(payload, JWT_SECRET);

    const redirectUrl = `${PAGINA_URL}?token=${token}`;
    res.json({ redirect_url: redirectUrl });

  } catch (error) {
    console.error('Erro ao gerar token JWT ou redirecionamento:', error);
    res.status(500).json({ error: 'Erro ao gerar link de pagamento' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
