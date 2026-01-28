import React, { useState, useRef } from 'react';
import { usePlacas } from '../hooks/usePlacas';

const Placas = () => {
    const {
        placas,
        addPlaca,
        updatePlaca,
        deletePlaca,
        addWhatsapp,
        editWhatsapp,
        deleteWhatsapp
    } = usePlacas();

    const modalRef = useRef(null);
    const [newPlacaNumber, setNewPlacaNumber] = useState('');
    const [newPlacaDescription, setNewPlacaDescription] = useState('');

    const handleAddPlaca = async (e) => {
        e.preventDefault();
        const data = {
            number: newPlacaNumber,
            description: newPlacaDescription,
            whatsapps: []
        };

        const success = await addPlaca(data);
        if (success) {
            closeModal();
        }
    };

    const openModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const closeModal = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
        setNewPlacaNumber('');
        setNewPlacaDescription('');
    };

    const handleEditPlaca = (id, currentNumber) => {
        const newNumber = prompt("Edit Plate Number:", currentNumber);
        if (newNumber && newNumber !== currentNumber) {
            updatePlaca(id, { number: newNumber });
        }
    };

    const handleAddWhatsapp = (id) => {
        const number = prompt("Enter WhatsApp Number:");
        if (number) {
            addWhatsapp(id, number);
        }
    };

    const handleEditWhatsapp = (id, index, currentNumber) => {
        const newNumber = prompt("Edit WhatsApp Number:", currentNumber);
        if (newNumber && newNumber !== currentNumber) {
            editWhatsapp(id, index, newNumber);
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
                        onClick={openModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
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
                                    <button onClick={() => handleEditPlaca(placa.id, placa.number)} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
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
                                    <button onClick={() => handleAddWhatsapp(placa.id)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold">
                                        <svg className="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Add Number
                                    </button>
                                </div>
                                {placa.whatsapps && placa.whatsapps.map((wa, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800">
                                        <span>{wa}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditWhatsapp(placa.id, idx, wa)} className="text-gray-500 hover:text-blue-600">
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

            <dialog ref={modalRef} className="rounded-lg shadow-xl backdrop:bg-gray-500/75 p-0 sm:max-w-lg w-full" style={{ width: '50%' }}>
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
                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Save
                            </button>
                            <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Placas;
