import React, { useState, useEffect } from 'react';
import './DataManagementSection.css'; // 공통 스타일

function SalesHistory() {
    const [salesRecords, setSalesRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchFilters, setSearchFilters] = useState({
        startDate: '',
        endDate: '',
        // itemName: '', // 백엔드에서 지원하지 않는다면 주석 처리
    });
    const [editingRecordId, setEditingRecordId] = useState(null); // 수정 중인 레코드 ID
    const [editFormData, setEditFormData] = useState({}); // 수정 폼 데이터

    useEffect(() => {
        fetchSalesRecords();
    }, []);

    const fetchSalesRecords = async (filters = searchFilters) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append('start_date', filters.startDate);
            if (filters.endDate) queryParams.append('end_date', filters.endDate);
            // if (filters.itemName) queryParams.append('item_name', filters.itemName);

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/sales/records/?${queryParams.toString()}`, {
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
            // item_code, item_name은 수정하지 않으므로 포함하지 않음
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

            const response = await fetch(`/api/sales/records/${id}/`, {
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
            const response = await fetch(`/api/sales/records/${id}/`, {
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
                    <label htmlFor="startDate">시작 날짜:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={searchFilters.startDate}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">종료 날짜:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={searchFilters.endDate}
                        onChange={handleSearchChange}
                    />
                </div>
                {/* 품목명 검색은 백엔드 API에서 지원하지 않는다면 주석 처리하거나 백엔드 구현 필요 */}
                {/* <div className="form-group">
                    <label htmlFor="itemNameSearch">품목명:</label>
                    <input
                        type="text"
                        id="itemNameSearch"
                        name="itemName"
                        value={searchFilters.itemName}
                        onChange={handleSearchChange}
                        placeholder="품목명으로 검색"
                    />
                </div> */}
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