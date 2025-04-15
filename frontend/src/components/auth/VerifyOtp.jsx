import { useState } from 'react';
import { api } from '../misc/api';
export function VerifyOtp() {
  const [otp, setOTP] = useState('');
  function handleVerifyOtp() {
    api.verifyOtp({
      otp:otp
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
      <h2 className="text-xl">OTP</h2>
      <p className="text-sm">Enter the OTP sent to your email</p>
    
    <form onSubmit={(e)=>{
      e.preventDefault();
      handleVerifyOtp();
    }} className="flex flex-col gap-2">
      <label className="text-sm" htmlFor="otp">OTP</label>
      <input className="bg-gray-50 border border-gray-200 text-sm rounded p-2"
        name="otp"
        type="text"
        placeholder="OTP"
        onChange={(e) => setOTP(e.target.value)}
        minLength={6}
        maxLength={6}
      />
      <button className="bg-gray-700 text-white rounded px-4 py-2 text-sm">Submit</button>
    </form>
    </div>
  );
}
