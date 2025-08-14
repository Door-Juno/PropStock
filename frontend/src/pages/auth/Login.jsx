import React, {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login () {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate() ; // 페이지 이동을 위한 훅

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        setError(''); 

        try {
            // login API 들어오는 자리임.
            // 실제 API 는 환경변수로 관리할 것
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login/`, {
                email,
                password,
            });

            // 로그인 성공시
            const { access , refresh } = response.data ; 
            // 토큰은 로컬 스토리지에 저장
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            navigate('/dashboard');
        }

        catch (err) {
            console.error('로그인 실패:',err);
            if ( err.response && err.response.data ){
                setError(err.response.data.detail || '아이디 또는 비밀번호가 일치하지 않습니다.');
            }
            else {
                setError('로그인 중 오류가 발생했습니다.');
            }
        }
    } ;

    return (
        <div className='login-contatiner'>
            <div className='login-box'>
                <h2>로그인</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='email'> 이메일</label>
                        <input
                            type='email'
                            id='email'
                            value={email}
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
                    {error && <p className='error-message'>{error}</p>}
                    <button type='submit' className='login-button'>로그인</button>
                </form>
                <p className='signup-link-container'>
                    <Link to='/signup' className="signup-link">회원가입</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;