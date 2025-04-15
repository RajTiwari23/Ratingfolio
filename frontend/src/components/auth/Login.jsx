import { useState, useRef } from 'react';
import {ChevronLeft} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '../misc/api';
export function Login() {
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  function handleLogin() {
    const data = {
      email:email,
      password:passwordRef.current.value
    }
    api.login(data).then((res)=>{
      if(res.status === "SUCCESS"){
        alert(res.message)
        setTimeout(()=>{navigate("/")}, 1000) 
      }else{
        alert(res.message)
      }
    });
  }
  return (
    <div className="w-96 flex flex-col justify-center min-h-screen gap-2">
      <h2 className="flex gap-1"><Link to="/"><ChevronLeft /></Link>Back to<Link to="/" className="text-blue-500"> Home</Link></h2>

      <h3 className="text-xl">Welcome Back!</h3>
      <p className="text-sm">Sign in to find your rating in one place.</p>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <label className="text-sm" htmlFor="email">
          Email
        </label>
        <input
          className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
          name="email"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="text-sm" htmlFor="password">
          Password
        </label>
        <input
          ref={passwordRef}
          className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
          name="email"
          type="password"
          placeholder="Password"
        />
        <Link className="my-2 text-xs ml-auto text-blue-500" to="/forgot-password">
          Forgot Password?
        </Link>
        <button className="bg-gray-700 text-white py-2 rounded">Sign in</button>
      </form>
      <p className="text-sm">
        Don't have an account?{' '}
        <Link className="text-blue-500" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
}
