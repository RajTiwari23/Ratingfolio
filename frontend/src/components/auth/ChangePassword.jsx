import { useState } from "react";
export function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  return (
    <div className="w-96 flex flex-col justify-center min-h-screen gap-2">
      <h2 className="text-xl">Change Password</h2>
      <p className="text-sm">Change your password</p>
    <form className="flex flex-col gap-2">
      <label className="text-sm" htmlFor="password">Password</label>
      <input className="bg-gray-50 border border-gray-200 text-sm rounded p-2" name="password" type="password" placeholder="Password" />
      <label className="text-sm" htmlFor="confirm-password">Confirm Password</label>
      <input className="bg-gray-50 border border-gray-200 text-sm rounded p-2" name="confirm-password" type="password" placeholder="Confirm password" />
      <button className="bg-gray-700 text-white rounded px-4 py-2 text-sm">Change Password</button>
    </form>
    </div>
  );
}
