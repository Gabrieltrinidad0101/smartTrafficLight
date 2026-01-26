import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Placas = () => {
    const [placas, setPlacas] = useState([
        { id: 1, number: "ABC-123", description: "Test Plate", whatsapps: ["+123456789"] }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlacaNumber, setNewPlacaNumber] = useState('');
    const [newPlacaDescription, setNewPlacaDescription] = useState('');

    const handleAddPlaca = async (e) => {
        e.preventDefault();
        const data = {
            id: Date.now(),
            number: newPlacaNumber,
            description: newPlacaDescription,
            whatsapps: []
        };

        try {
            const response = await fetch('http://localhost:3000/placas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                console.log('Data sent successfully');
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }

        setPlacas([...placas, data]);
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewPlacaNumber('');
        setNewPlacaDescription('');
    };

    const deletePlaca = (id) => {
        if (confirm("Are you sure?")) {
            setPlacas(placas.filter(p => p.id !== id));
        }
    };

    const editPlaca = (id) => {
        const placa = placas.find(p => p.id === id);
        if (placa) {
            const newNumber = prompt("Edit Plate Number:", placa.number);
            if (newNumber) {
                setPlacas(placas.map(p => p.id === id ? { ...p, number: newNumber } : p));
            }
        }
    };

    const addWhatsapp = (id) => {
        const number = prompt("Enter WhatsApp Number:");
        if (number) {
            setPlacas(placas.map(p => {
                if (p.id === id) {
                    return { ...p, whatsapps: [...p.whatsapps, number] };
                }
                return p;
            }));
        }
    };

    const editWhatsapp = (placaId, index) => {
        const placa = placas.find(p => p.id === placaId);
        if (placa) {
            const newNumber = prompt("Edit WhatsApp Number:", placa.whatsapps[index]);
            if (newNumber) {
                setPlacas(placas.map(p => {
                    if (p.id === placaId) {
                        const newWhatsapps = [...p.whatsapps];
                        newWhatsapps[index] = newNumber;
                        return { ...p, whatsapps: newWhatsapps };
                    }
                    return p;
                }));
            }
        }
    };

    const deleteWhatsapp = (placaId, index) => {
        if (confirm("Delete this number?")) {
            setPlacas(placas.map(p => {
                if (p.id === placaId) {
                    const newWhatsapps = [...p.whatsapps];
                    newWhatsapps.splice(index, 1);
                    return { ...p, whatsapps: newWhatsapps };
                }
                return p;
            }));
        }
    };

    return (
        <div id="placas-view-root" className="flex flex-col h-full text-gray-900 bg-white p-6 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Placas Management</h1>
                        <p className="text-gray-600 mt-1">Manage detected license plates and notification settings</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-gray px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add New Placa
                    </button>
                </div>

                <div id="placas-list-container" className="space-y-4">
                    {placas.map((placa) => (
                        <div key={placa.id} className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{placa.number}</h3>
                                    {placa.description && <p className="text-sm text-gray-600 mt-1">{placa.description}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editPlaca(placa.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button onClick={() => deletePlaca(placa.id)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>WhatsApp Numbers</span>
                                    <button onClick={() => addWhatsapp(placa.id)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold">
                                        <svg className="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Add Number
                                    </button>
                                </div>
                                {placa.whatsapps.map((wa, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800">
                                        <span>{wa}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => editWhatsapp(placa.id, idx)} className="text-gray-500 hover:text-blue-600">
                                                <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => deleteWhatsapp(placa.id, idx)} className="text-gray-500 hover:text-red-600">
                                                <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">Add New Placa</h3>
                                <form onSubmit={handleAddPlaca}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="placa-number">
                                            Placa Number
                                        </label>
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="placa-number"
                                            type="text"
                                            placeholder="Enter plate number"
                                            required
                                            value={newPlacaNumber}
                                            onChange={(e) => setNewPlacaNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="placa-description">
                                            Description
                                        </label>
                                        <textarea
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="placa-description"
                                            rows="3"
                                            placeholder="Enter description"
                                            value={newPlacaDescription}
                                            onChange={(e) => setNewPlacaDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-4">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Placas;
