/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Security Dashboard page for AI Text Summarizer
 * Displays security logs and suspicious activities
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SecurityLog {
    timestamp: string;
    level: string;
    message: string;
    eventType?: string;
    severity?: string;
    clientIp?: string;
    userAgent?: string;
    url?: string;
    method?: string;
}

/**
 * SecurityDashboard component - Security monitoring interface
 * Shows security logs in a table format
 * @returns JSX element containing the security dashboard
 */
const SecurityDashboard = ({ onBack }: { onBack?: () => void }) => {
    const { token } = useAuth();
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSecurityLogs();
    }, []);

    const fetchSecurityLogs = async () => {
        try {
            setLoading(true);
            const headers: HeadersInit = {};

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/api/security/logs', {
                headers
            });
            const data = await response.json();

            if (data.success) {
                setLogs(data.data.logs);
            } else {
                setError(data.error || 'Failed to fetch security logs');
            }
        } catch (err) {
            setError('Failed to connect to security service');
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading security logs...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800">Error: {error}</p>
                        <button
                            onClick={fetchSecurityLogs}
                            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                ← Back
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">
                            Security Dashboard
                        </h1>
                    </div>
                    <button
                        onClick={fetchSecurityLogs}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Security Events ({logs.length} total)
                        </h2>
                    </div>

                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No security events found
                        </div>
                    ) : (
                        <div className="overflow-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Severity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Event Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            IP Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Request
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.map((log, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatTimestamp(log.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                                                    {log.severity || log.level || 'INFO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.eventType || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {log.message}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.clientIp || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.method && log.url ? `${log.method} ${log.url}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
