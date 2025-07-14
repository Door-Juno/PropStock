// src/pages/DataManagement/SalesDataUpload.jsx
import React, { useState, useRef } from 'react';
import './DataManagementSection.css'; // 공통 스타일

function SalesDataUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadResult, setUploadResult] = useState(null); // { success: true, message: "...", errors: [] }
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage('');
            setError('');
            setUploadResult(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setMessage('');
            setError('');
            setUploadResult(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('업로드할 파일을 선택해주세요.');
            return;
        }

        setMessage('파일 업로드 중...');
        setError('');
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // 데이터 전송: POST /api/sales/bulk-upload/
            const response = await fetch('/api/sales/bulk-upload/', {
                method: 'POST',
                // headers: { 'Authorization': `Bearer ${token}` }, // 인증 토큰
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text(); // 오류 메시지를 텍스트로 받기
                throw new Error(`파일 업로드 실패: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            setUploadResult(result);
            setMessage('파일 업로드가 완료되었습니다.');
            setSelectedFile(null); // 업로드 후 파일 초기화

        } catch (err) {
            setError(`파일 업로드 중 오류 발생: ${err.message}`);
            setUploadResult(null);
        }
    };

    const handleDownloadTemplate = () => {
        // 실제로는 백엔드에서 제공하는 템플릿 다운로드 API를 호출합니다.
        // 예: window.open('/api/sales/template/download/');
        alert('판매 데이터 업로드 템플릿을 다운로드합니다. (실제 기능 구현 필요)');
        // 임시로 링크를 제공하거나 로컬 파일 다운로드 로직을 여기에 추가할 수 있습니다.
    };

    return (
        <div className="data-management-section">
            <h2>과거 판매 데이터 업로드</h2>
            {message && <p className="form-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <button onClick={handleDownloadTemplate} className="download-template-button">
                템플릿 다운로드 (.xlsx)
            </button>

            <div
                className={`file-drop-area ${isDragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current.click()}
            >
                <p>파일을 여기에 끌어다 놓거나 클릭하여 선택하세요.</p>
                <p>지원 형식: CSV, Excel (.xlsx)</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
                {selectedFile && <p className="file-name">선택된 파일: {selectedFile.name}</p>}
            </div>

            <button
                onClick={handleUpload}
                className="data-management-submit-button"
                disabled={!selectedFile}
            >
                업로드
            </button>

            {uploadResult && (
                <div className="upload-result">
                    <h4>업로드 결과</h4>
                    <p>총 처리된 행: {uploadResult.total_rows}</p>
                    <p>성공적으로 처리된 행: <span style={{ color: 'green' }}>{uploadResult.success_rows}</span></p>
                    {uploadResult.failed_rows > 0 && (
                        <>
                            <p>실패한 행: <span style={{ color: 'red' }}>{uploadResult.failed_rows}</span></p>
                            <h4>오류 내용:</h4>
                            <ul>
                                {uploadResult.errors.map((err, index) => (
                                    <li key={index} className="error">
                                        행 {err.row_number}: {err.message}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {uploadResult.message && <p>{uploadResult.message}</p>}
                </div>
            )}
        </div>
    );
}

export default SalesDataUpload;