import React, {useState} from "react";
import { useNavigate, link } from "react-router-dom";
import axios from 'axios';
import './Signup.css'

function Signup() {
    // User table
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [useremail, setEmail] = useState('');

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
            const response = await axios.post('http://localhost:8000/api/auth/signup', {
                username,
                useremail,
                password,
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
                if(errorData.username) setError('아이디: ${errorData.username[0]}');
                else if (errorData.useremail) setError('이메일: ${errorData.useremail[0]}');

            }
        }

    }
}