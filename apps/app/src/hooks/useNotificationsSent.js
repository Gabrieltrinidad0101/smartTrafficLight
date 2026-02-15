import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/apiRequest';

const API_URL = 'http://localhost:3000/api/notifications-sent';

export const useNotificationsSent = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ search: '', type: '', limit: 20, offset: 0 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const query = new URLSearchParams();
        if (params.search) query.set('search', params.search);
        if (params.type) query.set('type', params.type);
        query.set('limit', params.limit);
        query.set('offset', params.offset);

        const [result, err] = await apiRequest(`${API_URL}?${query.toString()}`);
        setLoading(false);
        if (err) return;
        if (result) {
            setData(result.data || []);
            setTotal(result.total || 0);
        }
    }, [params]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const search = (search) => setParams(prev => ({ ...prev, search, offset: 0 }));
    const filterType = (type) => setParams(prev => ({ ...prev, type, offset: 0 }));
    const goToPage = (page) => setParams(prev => ({ ...prev, offset: page * prev.limit }));
    const currentPage = Math.floor(params.offset / params.limit);
    const totalPages = Math.ceil(total / params.limit);

    return { data, total, loading, search, filterType, goToPage, currentPage, totalPages, params };
};
