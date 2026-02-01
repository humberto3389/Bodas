import { useState, useMemo } from 'react';
import { type Client } from '../lib/clients-admin';

export function useClientFiltering(clients: Client[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const nameSearch = (client.clientName || '').toLowerCase();
            const emailSearch = (client.email || '').toLowerCase();
            const tokenSearch = (client.token || '').toLowerCase();
            const subdomainSearch = (client.subdomain || '').toLowerCase();
            const term = searchTerm.toLowerCase();

            const matchesSearch = nameSearch.includes(term) ||
                emailSearch.includes(term) ||
                tokenSearch.includes(term) ||
                subdomainSearch.includes(term);

            const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
            const matchesPlan = filterPlan === 'all' || client.plan === filterPlan;

            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [clients, searchTerm, filterStatus, filterPlan]);

    return {
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterPlan,
        setFilterPlan,
        activeView,
        setActiveView,
        filteredClients
    };
}
