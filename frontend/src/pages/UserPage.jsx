import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { api } from '../components/misc/api';
import { UpdateProfile, UserPlatform } from '../components/user';
import { useNavigate } from 'react-router-dom';
import ModelProvider from '../components/provider/ModalProvider'

export function UserPage() {
  const [data,setData] = useState(null);
  const navigate = useNavigate();
  useEffect(()=>{
    api.getUserData().then((res)=>{
      if(res.status==="SUCCESS")
        setData(res.data)
      else{
        if(res.message==="Unauthorized") navigate("/login")
        console.log(res)
      }
    })
  },[])
  function handleSyncData(){
    api.extractUserInfo().then((res)=>{
      if(res.status==="SUCCESS")
        alert(res.data.message)
      else
        alert(res.message)
    })
  }
  return (
    <ModelProvider>
      <Header />
      <div className="min-h-[80vh]">
        <div className="h-40 border rounded-md p-4 flex items-end">
          <h4>Welcome, @{data?.user.username}</h4>
        </div>
        <button onClick={handleSyncData} className="bg-slate-400 px-6 py-2 rounded text-slate-50 text-sm my-1">Sync data</button>
        <div className="flex gap-2">
          <UserPlatform />
          <UpdateProfile />
        </div>
      </div>
      <Footer />
    </ModelProvider>
  );
}
