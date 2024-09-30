// src/components/TinyUrlApp.js
import React, { useState } from 'react';
import axios from 'axios';

const TinyUrlApp = () => {
    const [url, setUrl] = useState('');
    const [shortUrls, setShortUrls] = useState([]);

    // URL base del backend, usando variable de entorno
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${backendUrl}/api/shorten`, { url });
            setShortUrls([...shortUrls, { _id: response.data._id, originalUrl: url, shortUrl: response.data.shortUrl }]);
            setUrl(''); // Clear the input field
        } catch (error) {
            console.error('Error shortening the URL:', error);
        }
    };

    const handleEdit = async (index) => {
        const newUrl = prompt('Enter the new URL:');
        if (newUrl) {
            const urlToEdit = shortUrls[index];

            try {
                // Hacer la solicitud PUT al backend
                await axios.put(`${backendUrl}/api/urls/${urlToEdit._id}`, { newUrl });
                
                // Actualizar el estado local solo si la edición fue exitosa
                const updatedUrls = [...shortUrls];
                updatedUrls[index].originalUrl = newUrl;
                setShortUrls(updatedUrls);
            } catch (error) {
                console.error('Error editing the URL:', error);
            }
        }
    };

    const handleDelete = async (index) => {
        const urlToDelete = shortUrls[index];

        try {
            // Hacer la solicitud DELETE al backend
            await axios.delete(`${backendUrl}/api/urls/${urlToDelete._id}`);
            
            // Actualizar el estado local solo si la eliminación fue exitosa
            const updatedUrls = shortUrls.filter((_, i) => i !== index);
            setShortUrls(updatedUrls);
        } catch (error) {
            console.error('Error deleting the URL:', error);
        }
    };

    return (
        <div className="container mt-5 d-flex flex-column align-items-center">
            {/* Card for input */}
            <div className="card shadow p-4 mb-4" style={{ width: '100%', maxWidth: '600px', borderRadius: '15px' }}>
                <h2 className="text-center mb-4">Tiny URL Generator</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="url" className="form-label">Enter URL to shorten:</label>
                        <input 
                            type="url" 
                            className="form-control" 
                            id="url" 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Shorten URL</button>
                </form>
            </div>

            {/* Table for shortened URLs */}
            {shortUrls.length > 0 && (
                <div className="w-100" style={{ maxWidth: '800px' }}>
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Original URL</th>
                                <th>Shortened URL</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shortUrls.map((urlObj, index) => (
                                <tr key={urlObj._id}>
                                    <td>{urlObj.originalUrl}</td>
                                    <td>
                                        <a href={urlObj.shortUrl} target="_blank" rel="noopener noreferrer">
                                            {urlObj.shortUrl}
                                        </a>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-warning btn-sm me-2" 
                                            onClick={() => handleEdit(index)}>
                                            Edit
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={() => handleDelete(index)}>
                                            Delete
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
