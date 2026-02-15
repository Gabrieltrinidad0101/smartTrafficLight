import React, { useState } from 'react';
import { useNotificationsSent } from '../hooks/useNotificationsSent';

const NotificationsSent = () => {
    const { data, total, loading, search, filterType, goToPage, currentPage, totalPages, params } = useNotificationsSent();
    const [searchInput, setSearchInput] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        search(searchInput);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div id="notifications-sent-root" className="flex flex-col h-full text-gray-900 bg-white p-6 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Notifications Sent</h1>
                    <p className="text-gray-600 mt-1">History of all WhatsApp alerts sent by the system</p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by name, camera or number..."
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors text-white shrink-0">
                            Search
                        </button>
                    </form>
                    <div className="flex gap-2">
                        {['', 'plate', 'person'].map((t) => (
                            <button
                                key={t}
                                onClick={() => filterType(t)}
                                className={`px-3 py-2 text-sm rounded-md border transition-colors ${params.type === t
                                    ? 'bg-green-100 text-green-800 font-semibold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                {t === '' ? 'All' : t === 'plate' ? 'Plates' : 'Persons'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-500 mb-4">{total} result{total !== 1 ? 's' : ''} found</p>

                {/* Table */}
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : data.length === 0 ? (
                    <p className="text-gray-500">No notifications sent yet.</p>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camera</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{item.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{item.camera || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{item.toNumber}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${item.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsSent;
