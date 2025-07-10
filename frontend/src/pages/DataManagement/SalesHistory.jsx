// src/pages/DataManagement/SalesHistory.jsx
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
        itemName: '',
    });
    const [editingRecordId, setEditingRecordId] = useState(null); // 수정 중인 레코드 ID
    const [editFormData, setEditFormData] = useState({}); // 수정 폼 데이터

    useEffect(() => {
        // 컴포넌트 마운트 시 초기 데이터 로드
        fetchSalesRecords();
    }, []); // 빈 배열: 최초 1회만 실행

    const fetchSalesRecords = async (filters = searchFilters) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append('start_date', filters.startDate);
            if (filters.endDate) queryParams.append('end_date', filters.endDate);
            if (filters.itemName) queryParams.append('item_name', filters.itemName);

            // 데이터 조회: GET /api/sales/records/
            const response = await fetch(`/api/sales/records/?${queryParams.toString()}`);
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
        setEditFormData({ ...record }); // 현재 레코드 데이터로 폼 채우기
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
            // 데이터 수정: PUT/PATCH /api/sales/records/{id}/
            const response = await fetch(`/api/sales/records/${id}/`, {
                method: 'PATCH', // 부분 업데이트이므로 PATCH 사용
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const updatedRecord = await response.json();
            setSalesRecords(prevRecords =>
                prevRecords.map(rec => (rec.id === id ? updatedRecord : rec))
            );
            setEditingRecordId(null); // 수정 모드 종료
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
            // 데이터 삭제: DELETE /api/sales/records/{id}/
            const response = await fetch(`/api/sales/records/${id}/`, {
                method: 'DELETE',
                // headers: { 'Authorization': `Bearer ${token}` },
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
                <div className="form-group">
                    <label htmlFor="itemNameSearch">품목명:</label>
                    <input
                        type="text"
                        id="itemNameSearch"
                        name="itemName"
                        value={searchFilters.itemName}
                        onChange={handleSearchChange}
                        placeholder="품목명으로 검색"
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
                                            <td><input type="text" name="itemCode" value={editFormData.itemCode || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="text" name="itemName" value={editFormData.itemName || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="quantity" value={editFormData.quantity || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="price" value={editFormData.price || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="number" name="cost" value={editFormData.cost || ''} onChange={handleEditFormChange} /></td>
                                            <td><input type="checkbox" name="isPromotion" checked={editFormData.isPromotion || false} onChange={handleEditFormChange} /></td>
                                            <td>
                                                <button onClick={() => handleSaveEdit(record.id)}>저장</button>
                                                <button onClick={handleCancelEdit}>취소</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{record.date}</td>
                                            <td>{record.itemCode}</td>
                                            <td>{record.itemName}</td>
                                            <td>{record.quantity}</td>
                                            <td>{record.price.toLocaleString()}</td>
                                            <td>{record.cost.toLocaleString()}</td>
                                            <td>{record.isPromotion ? 'O' : 'X'}</td>
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