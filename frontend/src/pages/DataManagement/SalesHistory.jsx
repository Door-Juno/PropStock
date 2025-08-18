import React, { useState, useEffect } from 'react';
import './DataManagementSection.css';

function SalesHistory() {
    const [salesRecords, setSalesRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchFilters, setSearchFilters] = useState({
        startDate: '',
        endDate: '',
    });
    const [editingRecordId, setEditingRecordId] = useState(null); 
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
    }, []);

    const fetchSalesRecords = async (filters = searchFilters) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append('start_date', filters.startDate);
            if (filters.endDate) queryParams.append('end_date', filters.endDate);

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/records/?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSalesRecords(data);
            setMessage('판매 내역을 불러왔습니다.');
        } catch (err) {
            setError(`판매 내역 로드 실패: ${err.message}`);
            setSalesRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchSalesRecords(searchFilters);
    };

    const handleEditClick = (record) => {
        setEditingRecordId(record.id);
        // API 응답 필드명에 맞춰 editFormData 초기화
        setEditFormData({
            id: record.id,
            date: record.date,
            quantity: record.quantity,
            selling_price: record.selling_price,
            cost_price: record.cost_price,
            is_event_day: record.is_event_day,
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveEdit = async (id) => {
        setError('');
        setMessage('');
        try {
            const token = localStorage.getItem('accessToken');
            const dataToSend = {
                date: editFormData.date,
                quantity: editFormData.quantity,
                selling_price: editFormData.selling_price,
                cost_price: editFormData.cost_price,
                is_event_day: editFormData.is_event_day,
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/records/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const updatedRecord = await response.json();
            setSalesRecords(prevRecords =>
                prevRecords.map(rec => (rec.id === id ? updatedRecord : rec))
            );
            setEditingRecordId(null);
            setMessage('판매 기록이 성공적으로 수정되었습니다.');

        } catch (err) {
            setError(`판매 기록 수정 실패: ${err.message}`);
        }
    };

    const handleCancelEdit = () => {
        setEditingRecordId(null);
        setEditFormData({});
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말로 이 판매 기록을 삭제하시겠습니까?')) {
            return;
        }
        setError('');
        setMessage('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/records/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            setSalesRecords(prevRecords => prevRecords.filter(record => record.id !== id));
            setMessage('판매 기록이 성공적으로 삭제되었습니다.');

        } catch (err) {
            setError(`판매 기록 삭제 실패: ${err.message}`);
        }
    };

    return (
        <div className="data-management-section">
            <h2>판매 내역 조회</h2>
            {message && <p className="form-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSearchSubmit} className="search-filter-form">
                <div className="form-group">
                    <label htmlFor="searchDate">날짜 선택:</label>
                    <input
                        type="date"
                        id="searchDate"
                        name="searchDate"
                        value={searchFilters.startDate} 
                        onChange={(e) => setSearchFilters({
                            startDate: e.target.value,
                            endDate: e.target.value, 
                        })}
                    />
                </div>
                <button type="submit" className="data-management-submit-button">검색</button>
            </form>

            <div className="data-table-container">
                {loading ? (
                    <p>판매 내역 로딩 중...</p>
                ) : salesRecords.length === 0 ? (
                    <p>조회된 판매 내역이 없습니다.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>품목 코드</th>
                                <th>품목명</th>
                                <th>수량</th>
                                <th>판매가</th>
                                <th>원가</th>
                                <th>행사</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesRecords.map((record) => (
                                <tr key={record.id}>
                                    {editingRecordId === record.id ? (
                                        <>
                                            <td><input type="date" name="date" value={editFormData.date || ''} onChange={handleEditFormChange} /></td>
                                            <td>{record.item_code}</td> {/* 읽기 전용 */}
                                            <td>{record.item_name}</td> {/* 읽기 전용 */}
                                            <td><input type="number" name="quantity" value={editFormData.quantity || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="selling_price" value={editFormData.selling_price || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="cost_price" value={editFormData.cost_price || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="checkbox" name="is_event_day" checked={editFormData.is_event_day || false} onChange={handleEditFormChange} /></td>
                                            <td>
                                                <button onClick={() => handleSaveEdit(record.id)}>저장</button>
                                                <button onClick={handleCancelEdit}>취소</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{record.date}</td>
                                            <td>{record.item_code}</td>
                                            <td>{record.item_name}</td>
                                            <td>{record.quantity}</td>
                                            <td>{record.selling_price.toLocaleString()}</td>
                                            <td>{record.cost_price.toLocaleString()}</td>
                                            <td>{record.is_event_day ? 'O' : 'X'}</td>
                                            <td>
                                                <button className="edit-button" onClick={() => handleEditClick(record)}>수정</button>
                                                <button className="delete-button" onClick={() => handleDelete(record.id)}>삭제</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default SalesHistory;