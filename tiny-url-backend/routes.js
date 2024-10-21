const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TinyURLTable';

const app = express();
app.use(cors());
app.use(express.json());

// Crear una URL corta
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;
  const shortUrl = uuidv4().slice(0, 8); // ID único de 8 caracteres

  const params = {
    TableName: TABLE_NAME,
    Item: {
      _id: shortUrl,
      originalUrl: url,
      shortUrl: `http://localhost:3000/${shortUrl}`, // Cambia la URL base según sea necesario
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json(params.Item);
  } catch (error) {
    console.error('Error al acortar la URL:', error);
    res.status(500).json({ message: 'Error al acortar la URL' });
  }
});

// Obtener una URL corta por ID
app.get('/api/urls/:id', async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { _id: id },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ message: 'URL no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la URL:', error);
    res.status(500).json({ message: 'Error al obtener la URL' });
  }
});

// Actualizar una URL existente
app.put('/api/urls/:id', async (req, res) => {
  const { id } = req.params;
  const { newUrl } = req.body;

  const params = {
    TableName: TABLE_NAME,
    Key: { _id: id },
    UpdateExpression: 'set originalUrl = :url',
    ExpressionAttributeValues: {
      ':url': newUrl,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const result = await dynamoDB.update(params).promise();
    res.json(result.Attributes);
  } catch (error) {
    console.error('Error al actualizar la URL:', error);
    res.status(500).json({ message: 'Error al actualizar la URL' });
  }
});

// Eliminar una URL
app.delete('/api/urls/:id', async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { _id: id },
  };

  try {
    await dynamoDB.delete(params).promise();
    res.json({ message: 'URL eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la URL:', error);
    res.status(500).json({ message: 'Error al eliminar la URL' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
