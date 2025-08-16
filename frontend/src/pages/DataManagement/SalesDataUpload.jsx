import React, { useState, useRef } from 'react';
import axios from 'axios';
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
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('로그인이 필요합니다.');
                setMessage('');
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales/bulk-upload/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // 인증 토큰 추가
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json(); // JSON 형식의 에러 응답 처리
                throw new Error(errorData.message || `파일 업로드 실패: ${response.status}`);
            }

            const result = await response.json();
            setUploadResult({
                total_rows: result.total_rows,
                success_rows: result.processed_rows, // 백엔드의 processed_rows를 success_rows로 매핑
                failed_rows: result.failed_rows,
                errors: result.errors,
                message: result.message || '파일 업로드가 완료되었습니다.'
            });
            setMessage('파일 업로드가 완료되었습니다.');
            setSelectedFile(null); // 업로드 후 파일 초기화

        } catch (err) {
            setError(`파일 업로드 중 오류 발생: ${err.message}`);
            setUploadResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('템플릿 다운로드를 위해 로그인이 필요합니다.');
                return;
            }

            setMessage('템플릿 다운로드 중...');
            setError('');

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sales/template/download/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob', // 파일을 바이너리 데이터로 받기 위해 blob 타입으로 설정
            });

            // 파일 다운로드 트리거
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sales_upload_template.xlsx'); // 다운로드될 파일명 설정
            document.body.appendChild(link);
            link.click();
            link.remove(); // 링크 제거
            window.URL.revokeObjectURL(url); // 임시 URL 해제

            setMessage('템플릿 다운로드가 완료되었습니다.');

        } catch (err) {
            setError(`템플릿 다운로드 실패: ${err.response && err.response.status === 401 ? '인증 실패' : err.message}`);
            console.error('템플릿 다운로드 오류:', err.response ? err.response.data : err);
        }
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