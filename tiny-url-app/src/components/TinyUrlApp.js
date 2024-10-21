// src/components/TinyUrlApp.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TinyUrlApp = () => {
    const [url, setUrl] = useState('');
    const [shortUrls, setShortUrls] = useState([]);

    // URL base del backend, usando variable de entorno
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://3.84.203.164:4000';

    // Cargar las URLs acortadas al inicio
    useEffect(() => {
        const fetchUrls = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/urls`);
                setShortUrls(response.data);
            } catch (error) {
                console.error('Error al obtener las URLs:', error);
                alert('Error al cargar las URLs');
            }
        };
        fetchUrls();
    }, [backendUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${backendUrl}/api/shorten`, { url });
            setShortUrls([...shortUrls, response.data]);
            setUrl(''); // Limpiar el campo de entrada
            alert('URL acortada con éxito');
        } catch (error) {
            console.error('Error al acortar la URL:', error);
            alert('Error al acortar la URL');
        }
    };

    const handleEdit = async (index) => {
        const newUrl = prompt('Introduce la nueva URL:');
        if (newUrl) {
            const urlToEdit = shortUrls[index];
    
            try {
                const response = await axios.put(
                    `${backendUrl}/api/urls/${urlToEdit.shortURL}`,
                    { originalURL: urlToEdit.originalURL, newUrl }
                );
                if (response.status === 200) {
                    const updatedUrls = [...shortUrls];
                    updatedUrls[index].originalURL = newUrl;
                    setShortUrls(updatedUrls);
                    alert('URL actualizada con éxito');
                }
            } catch (error) {
                console.error('Error al editar la URL:', error);
                alert('Error al editar la URL');
            }
        }
    };
    
    const handleDelete = async (index) => {
        const urlToDelete = shortUrls[index];
    
        try {
            const response = await axios.delete(`${backendUrl}/api/urls/${urlToDelete.shortURL}`, {
                data: { originalURL: urlToDelete.originalURL }
            });
            if (response.status === 200) {
                const updatedUrls = shortUrls.filter((_, i) => i !== index);
                setShortUrls(updatedUrls);
                alert('URL eliminada con éxito');
            }
        } catch (error) {
            console.error('Error al eliminar la URL:', error);
            alert('Error al eliminar la URL');
        }
    };
    
    return (
        <div className="container mt-5 d-flex flex-column align-items-center">
            {/* Card para ingresar la URL */}
            <div className="card shadow p-4 mb-4" style={{ width: '100%', maxWidth: '600px', borderRadius: '15px' }}>
                <h2 className="text-center mb-4">Generador de Tiny URL</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="url" className="form-label">Introduce la URL para acortar:</label>
                        <input
                            type="url"
                            className="form-control"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Acortar URL</button>
                </form>
            </div>

            {/* Tabla para mostrar las URLs acortadas */}
            {shortUrls.length > 0 && (
                <div className="w-100" style={{ maxWidth: '800px' }}>
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>URL Original</th>
                                <th>URL Acortada</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shortUrls.map((urlObj, index) => (
                                <tr key={urlObj.shortURL}>
                                    <td>{urlObj.originalURL}</td>
                                    <td>
                                        <a
                                            href={`http://3.84.203.164:4000/${urlObj.shortURL}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {`http://3.84.203.164:4000/${urlObj.shortURL}`}
                                        </a>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handleEdit(index)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(index)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TinyUrlApp;
