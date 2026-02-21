import React, { useState, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { apiRequest } from '../utils/apiRequest';

const FACES_API_URL = 'http://localhost:3000/api/faces';

const LAYOUT_OPTIONS = [
    { value: 'list', label: 'List' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
];

const gridClass = {
    list: '',
    2: 'grid grid-cols-2 gap-4',
    3: 'grid grid-cols-3 gap-4',
    4: 'grid grid-cols-4 gap-4',
    5: 'grid grid-cols-5 gap-4',
};

const Notifications = () => {
    const {
        notifications,
        addNotification,
        updateNotification,
        deleteNotification,
        addWhatsapp,
        editWhatsapp,
        deleteWhatsapp
    } = useNotifications();

    const createModalRef = useRef(null);
    const editModalRef = useRef(null);

    const [layout, setLayout] = useState('list');

    // Faces from Frigate
    const [faceNames, setFaceNames] = useState([]);
    const [loadingFaces, setLoadingFaces] = useState(false);

    // Create form
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('plate');
    const [newDescription, setNewDescription] = useState('');

    // Edit form
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // --- Create ---
    const handleAddNotification = async (e) => {
        e.preventDefault();
        await addNotification({
            name: newName,
            type: newType,
            description: newDescription,
            whatsapps: []
        });
        closeCreateModal();
    };

    const openCreateModal = async () => {
        createModalRef.current?.showModal();
        setLoadingFaces(true);
        const [data] = await apiRequest(FACES_API_URL);
        setFaceNames(Array.isArray(data) ? data : []);
        setLoadingFaces(false);
    };
    const closeCreateModal = () => {
        createModalRef.current?.close();
        setNewName('');
        setNewType('plate');
        setNewDescription('');
    };

    // --- Edit ---
    const openEditModal = (notification) => {
        setEditId(notification.id);
        setEditName(notification.name);
        setEditDescription(notification.description || '');
        editModalRef.current?.showModal();
    };

    const closeEditModal = () => {
        editModalRef.current?.close();
        setEditId(null);
        setEditName('');
        setEditDescription('');
    };

    const handleEditNotification = async (e) => {
        e.preventDefault();
        await updateNotification(editId, { name: editName, description: editDescription });
        closeEditModal();
    };

    // --- Toggle active ---
    const toggleActive = (notification) => {
        updateNotification(notification.id, { active: !notification.active });
    };

    // --- WhatsApp helpers ---
    const handleAddWhatsapp = (id) => {
        const number = prompt("Enter WhatsApp Number:");
        if (number) addWhatsapp(id, number);
    };

    const handleEditWhatsapp = (id, index, currentNumber) => {
        const newNumber = prompt("Edit WhatsApp Number:", currentNumber);
        if (newNumber && newNumber !== currentNumber) editWhatsapp(id, index, newNumber);
    };

    const isGrid = layout !== 'list';

    return (
        <div id="notifications-view-root" className="flex flex-col h-full text-gray-900 bg-white p-6 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications Management</h1>
                        <p className="text-gray-600 mt-1">Manage notification settings for plates and persons</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add New
                    </button>
                </div>

                {/* Layout selector */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm text-gray-600 font-medium">View:</span>
                    {LAYOUT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setLayout(opt.value)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${layout === opt.value
                                ? 'text-xs font-semibold px-2 py-0.5 rounded shrink-0 bg-green-100 text-green-800'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Notification cards */}
                <div className={isGrid ? gridClass[layout] : 'space-y-4'}>
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-gray-100 border rounded-lg p-4 shadow-sm ${notification.active ? 'border-gray-200' : 'border-red-300 opacity-60'}`}
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{notification.name}</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">{notification.type}</span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${notification.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {notification.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {notification.description && <p className="text-sm text-gray-600 mt-1 truncate">{notification.description}</p>}
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                    {/* Toggle active */}
                                    <button onClick={() => toggleActive(notification)} className={`p-2 rounded ${notification.active ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`} title={notification.active ? 'Deactivate' : 'Activate'}>
                                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {notification.active
                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-4.879-4.879"></path>
                                            }
                                        </svg>
                                    </button>
                                    {/* Edit */}
                                    <button onClick={() => openEditModal(notification)} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    {/* Delete */}
                                    <button onClick={() => deleteNotification(notification.id)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* WhatsApp numbers */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>WhatsApp Numbers</span>
                                    <button onClick={() => handleAddWhatsapp(notification.id)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold">
                                        <svg className="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Add
                                    </button>
                                </div>
                                {notification.whatsapps && notification.whatsapps.map((wa, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800">
                                        <span className="truncate">{wa}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleEditWhatsapp(notification.id, idx, wa)} className="text-gray-500 hover:text-blue-600">
                                                <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => deleteWhatsapp(notification.id, idx)} className="text-gray-500 hover:text-red-600">
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

            {/* Create Modal */}
            <dialog ref={createModalRef} className="rounded-lg shadow-xl backdrop:bg-gray-500/75 p-0 sm:max-w-lg w-full" style={{ width: '50%' }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Notification</h3>
                    <form onSubmit={handleAddNotification}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="create-type">Type</label>
                            <select
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="create-type"
                                value={newType}
                                onChange={(e) => { setNewType(e.target.value); setNewName(''); }}
                            >
                                <option value="plate">Plate</option>
                                <option value="person">Person</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="create-name">Name</label>
                            {newType === 'person' ? (
                                loadingFaces ? (
                                    <p className="text-sm text-gray-500">Loading faces...</p>
                                ) : (
                                    <select
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="create-name"
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    >
                                        <option value="">Select a face</option>
                                        {faceNames
                                            .filter(name => !notifications.some(n => n.type === 'person' && n.name === name))
                                            .map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))
                                        }
                                    </select>
                                )
                            ) : (
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="create-name"
                                    type="text"
                                    placeholder="Enter plate number"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            )}
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="create-description">Description</label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="create-description"
                                rows="3"
                                placeholder="Enter description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-4">
                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Save
                            </button>
                            <button type="button" onClick={closeCreateModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* Edit Modal */}
            <dialog ref={editModalRef} className="rounded-lg shadow-xl backdrop:bg-gray-500/75 p-0 sm:max-w-lg w-full" style={{ width: '50%' }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Notification</h3>
                    <form onSubmit={handleEditNotification}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">Name</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="edit-name"
                                type="text"
                                required
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">Description</label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="edit-description"
                                rows="3"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-6 mt-4">
                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Save
                            </button>
                            <button type="button" onClick={closeEditModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Notifications;
