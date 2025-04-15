import { useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../misc/api';
export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  function handleRegister(){
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    if(password !== confirmPassword){
      alert("Passwords do not match")
      return;
    }
    api.register({
      username:username,
      email:email,
      password:password
    }).then((res)=>{
      if(res.status === "SUCCESS"){
        alert(res.message)
        setTimeout(()=>{navigate("/")}, 5000) 
      }else{
        alert(res.message)
      }
    })
  }
  return (
    <div className="w-96 flex flex-col justify-center min-h-screen gap-2">
      <h3 className="text-xl">New User!</h3>
      <p className="text-sm">Sign Up quickly.</p>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <label className="text-sm" htmlFor="name">
          Username
        </label>
        <input
          className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
          name="name"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <label className="text-sm" htmlFor="email">
          Email
        </label>
        <input
          className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
          name="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <label className="text-sm" htmlFor="password">
          Password
        </label>
        <input
          ref={passwordRef}
          className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
          name="password"
          type="password"
          placeholder="Password"
        />
        <label className="text-sm" htmlFor="confirm-password">
          Confirm Password
        </label>
        <input
          ref={confirmPasswordRef}
          className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
          name="confirm-password"
          type="password"
          placeholder="Confirm Password"
        />
        <button className="bg-gray-700 text-white py-2 rounded">Register</button>
      </form>
      <div className="flex items-center gap-2 text-sm">
        <p className="">Already have an account?</p>
        <Link className="text-blue-500" to="/login">Login</Link>
      </div>
    </div>
  );
}
