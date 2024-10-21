const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const shortid = require('shortid');

// Configuración de la aplicación
const app = express();
const PORT = 4000;

// Configurar DynamoDB
AWS.config.update({
    region: 'us-east-1', // Cambia si usas otra región
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'TinyURLTable'; // Nombre de la tabla

// Middleware
const corsOptions = {
    origin: '*', // Cambia a la URL del bucket si quieres restringir acceso
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json()); // Middleware para parsear JSON

// Rutas
// POST: Acortar una nueva URL
app.post('/api/shorten', async (req, res) => {
    const { url } = req.body;
    const shortUrl = shortid.generate();

    const params = {
        TableName: TABLE_NAME,
        Item: {
            shortURL: shortUrl,
            originalURL: url,
            createdAt: new Date().toISOString(),
        },
    };

    try {
        await dynamoDB.put(params).promise();
        res.json(params.Item); // Enviar la URL completa en la respuesta
    } catch (error) {
        console.error('Error al acortar la URL:', error);
        res.status(500).json({ message: 'Error al acortar la URL', error: error.message });
    }
});

// GET: Obtener todas las URLs acortadas
app.get('/api/urls', async (req, res) => {
    const params = { TableName: TABLE_NAME };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        console.error('Error al obtener las URLs:', error);
        res.status(500).json({ message: 'Error al obtener las URLs', error: error.message });
    }
});

// PUT: Actualizar una URL original
app.put('/api/urls/:shortURL', async (req, res) => {
    const { shortURL } = req.params;
    const { originalURL, newUrl } = req.body;

    const deleteParams = {
        TableName: TABLE_NAME,
        Key: { shortURL, originalURL },
    };

    const insertParams = {
        TableName: TABLE_NAME,
        Item: {
            shortURL,
            originalURL: newUrl,
            createdAt: new Date().toISOString(),
        },
    };

    try {
        await dynamoDB.delete(deleteParams).promise();
        await dynamoDB.put(insertParams).promise();
        res.json({ message: 'URL actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la URL:', error);
        res.status(500).json({ message: 'Error al actualizar la URL', error: error.message });
    }
});

// DELETE: Eliminar una URL
app.delete('/api/urls/:shortURL', async (req, res) => {
    const { shortURL } = req.params;
    const { originalURL } = req.body;

    const params = {
        TableName: TABLE_NAME,
        Key: { shortURL, originalURL },
    };

    try {
        await dynamoDB.delete(params).promise();
        res.json({ message: 'URL eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la URL:', error);
        res.status(500).json({ message: 'Error al eliminar la URL', error: error.message });
    }
});

// Redireccionar a la URL original
app.get('/:shortURL', async (req, res) => {
    const { shortURL } = req.params;

    const params = {
        TableName: TABLE_NAME,
        FilterExpression: 'shortURL = :shortURL',
        ExpressionAttributeValues: { ':shortURL': shortURL }
    };

    try {
        const data = await dynamoDB.scan(params).promise();

        if (data.Items.length > 0) {
            // Redirige a la URL original si se encuentra
            res.redirect(data.Items[0].originalURL);
        } else {
            res.status(404).json({ message: 'URL no encontrada' });
        }
    } catch (error) {
        console.error('Error al redirigir a la URL:', error);
        res.status(500).json({ message: 'Error al redirigir a la URL', error: error.message });
    }
});



// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
