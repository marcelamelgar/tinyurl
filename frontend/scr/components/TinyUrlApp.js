// src/components/TinyUrlApp.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const TinyUrlApp = () => {
    const [url, setUrl] = useState('');
    const [shortUrls, setShortUrls] = useState([]);

    // Obtener todas las URLs acortadas al cargar el componente
    useEffect(() => {
        const fetchUrls = async () => {
            const response = await axios.get('http://localhost:4000/api/urls');
            setShortUrls(response.data);
        };

        fetchUrls();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:4000/api/shorten', { url });
            setShortUrls([...shortUrls, { originalUrl: url, shortUrl: response.data.shortUrl }]);
            setUrl(''); // Clear the input field
        } catch (error) {
            console.error('Error shortening the URL:', error);
        }
    };

    const handleEdit = (index) => {
        const newUrl = prompt('Enter the new URL:');
        if (newUrl) {
            const updatedUrls = [...shortUrls];
            updatedUrls[index].originalUrl = newUrl;
            setShortUrls(updatedUrls);
        }
    };

    const handleDelete = async (index, id) => {
        try {
            await axios.delete(`http://localhost:4000/api/urls/${id}`);
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
                                <tr key={index}>
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
                                            onClick={() => handleDelete(index, urlObj._id)}>
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
