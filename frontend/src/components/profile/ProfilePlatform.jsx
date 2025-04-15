import {useState, useEffect} from "react";
import { api } from "../misc/api";
import {platformsPics} from "../misc/config";
import { useNavigate } from "react-router-dom";
export function ProfilePlatform({username}) {
  const [platforms, setPlatforms] = useState([]);
  const navigate = useNavigate()
  useEffect(()=>{
    api.getProfilePlatforms(username).then((res)=>{
      if(res.status==="SUCCESS"){
        setPlatforms(res.result)
      }else{
        console.error(res.message)
        alert(res.message)
        if(res.message==="Unauthorized") navigate("/login")
        if(res.message.toLowerCase()==="user not found") navigate("/profiles")
      }
    })
  },[])
  return (
<div className="col-span-2 rounded p-4 border h-96 border-slate-200 text-sm overflow-auto">
      <h3 className="font-medium text-lg mb-4 text-slate-700">Platforms</h3>
      
      {platforms.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          No platforms connected
        </div>
      ) : (
        <div className="grid gap-3">
          {platforms.map((obj) => (
            <div 
              key={obj.id} 
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <img 
                src={platformsPics[obj.platform]} 
                className="w-10 h-10 rounded-md object-contain" 
                alt={`${obj.platform} logo`} 
              />
              <div className="flex-1">
                <p className="font-medium text-slate-800">{obj.username}</p>
                <p className="text-slate-500 text-xs">{obj.platform}</p>
              </div>
              <div className="flex items-center bg-slate-100 px-2 py-1 rounded-md">
                <span className="font-medium text-slate-700">{obj.rating}</span>
                <span className="ml-1 text-yellow-500">★</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
