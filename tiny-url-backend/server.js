// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

// Configuración de la aplicación
const app = express();
const PORT = 4000;
// Usar la variable de entorno para la URL de conexión a MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/tinyurl';

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch((error) => console.error('Error conectando a MongoDB:', error));


// Definición del modelo URL
const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Url = mongoose.model('Url', urlSchema);

// Rutas
// Crear una nueva URL acortada
app.post('/api/shorten', async (req, res) => {
    const { url } = req.body;

    // Generar un identificador único para la URL corta
    const shortUrl = shortid.generate();

    try {
        const newUrl = new Url({ originalUrl: url, shortUrl });
        await newUrl.save();
        res.json({ _id: newUrl._id, shortUrl: `http://localhost:4000/${shortUrl}` });
    } catch (error) {
        console.error('Error al acortar la URL:', error);
        res.status(500).json({ message: 'Error al acortar la URL', error: error.message });
    }
});


// Obtener todas las URLs acortadas
app.get('/api/urls', async (req, res) => {
    try {
        const urls = await Url.find();
        res.json(urls);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las URLs', error });
    }
});

// Actualizar una URL original
app.put('/api/urls/:id', async (req, res) => {
    const { id } = req.params;
    const { newUrl } = req.body;

    try {
        const url = await Url.findById(id);
        if (url) {
            url.originalUrl = newUrl;
            await url.save();
            res.json({ message: 'URL actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'URL no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la URL', error });
    }
});

// Eliminar una URL
app.delete('/api/urls/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Url.findByIdAndDelete(id);
        res.json({ message: 'URL eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la URL', error });
    }
});

// Redireccionar a la URL original
app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const url = await Url.findOne({ shortUrl });
        if (url) {
            res.redirect(url.originalUrl);
        } else {
            res.status(404).json({ message: 'URL no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al redirigir a la URL', error });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
