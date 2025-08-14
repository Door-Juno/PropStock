import React, {useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import './Signup.css'

function Signup() {
    // User table
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [useremail, setEmail] = useState('');

    // Store table
    const [storeName, setStoreName] = useState('');
    const [storeIndustry, setStoreIndustry] = useState('');
    const [storeRegion, setStoreRegion] = useState('');

    // 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return ;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register/`, { 
                email: useremail, 
                username,
                password,
                store: {
                    name: storeName,
                    industry: storeIndustry,
                    region: storeRegion
                }
            });

            setSuccess('회원가입이 완료되었습니다!')

            // 3초후 로그인 페이지로 이동
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        catch (err) {
            console.error('회원가입 실패: ', err);
            if (err.response && err.response.data){
                const errorData = err.response.data ;
                // API 응답 형식에 따라 에러 메시지 처리 로직 수정
                if (errorData.email) setError(`이메일: ${errorData.email[0]}`);
                else if (errorData.username) setError(`아이디: ${errorData.username[0]}`);
                else if (errorData.password) setError(`비밀번호: ${errorData.password[0]}`);
                else if (errorData.store) setError(`상점 정보: ${JSON.stringify(errorData.store)}`);
                else setError(errorData.detail || '회원가입 중 오류가 발생했습니다.');
            }
        }

    }

    return (
        <div className='signup-container'>
            <div className='signup-box'>
                <h2>회원가입</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='username'>아이디</label>
                        <input
                            type='text'
                            id='username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='useremail'>이메일</label>
                        <input
                            type='email'
                            id='useremail'
                            value={useremail}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>비밀번호</label>
                        <input
                            type='password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='passwordConfirm'>비밀번호 확인</label>
                        <input
                            type='password'
                            id='passwordConfirm'
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='storeName'>상점 이름</label>
                        <input
                            type='text'
                            id='storeName'
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='storeIndustry'>업종</label>
                        <input
                            type='text'
                            id='storeIndustry'
                            value={storeIndustry}
                            onChange={(e) => setStoreIndustry(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='storeRegion'>지역</label>
                        <input
                            type='text'
                            id='storeRegion'
                            value={storeRegion}
                            onChange={(e) => setStoreRegion(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className='error-message'>{error}</p>}
                    {success && <p className='success-message'>{success}</p>}
                    <button type='submit' className='signup-button'>회원가입</button>
                </form>
                <p className='login-link-container'>
                    이미 계정이 있으신가요? <Link to='/login' className="login-link">로그인</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;