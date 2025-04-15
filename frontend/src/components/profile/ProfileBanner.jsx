import {useEffect, useState} from "react";
import { api } from "../misc/api";
import { ProfileHeatmap } from "./ProfileHeatmap";
import { useNavigate } from "react-router-dom";

export function ProfileBanner({username}) {
  const [daywise, setDayWise] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  useEffect(()=>{
    setLoading(true);
    api.getProfileDaywiseSubmissions(username).then((res)=>{
      if(res.status==="SUCCESS")
        setDayWise(res.result)
      else
        alert(res.message)
    }).finally(()=>{
      setLoading(false)
    })
    api.getProfileInfo(username).then((res)=>{
      if(res.status==="SUCCESS"){
        setProfile(res)
        
      }else{
        alert(res.message)
        if(res.message==="Unauthorized") navigate("/login")
        if(res.message.toLowerCase()==="user not found") navigate("/profiles")
      }
    })
  },[])
  console.log(profile)
  return (
    <div className="relative my-4 space-y-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <span>Loading...</span>
        </div>
      ) : (
        <ProfileHeatmap data={daywise} />
      )}
      <div className="pl-10 gap-4 border py-4 border-slate-200 rounded">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.user?.name || 'User')}`}
          alt="profile-image"
          className="w-20 h-20 rounded-full border-2 border-slate-200 bg-white"
        />
        <div>
          <h3 className="text-lg font-semibold">
            <span>{profile?.user?.name || 'Name not available'}</span> {'/'}
            <span className="text-slate-600">@{username}</span>
          </h3>
          <div className="mt-1">
            <h4 className="text-slate-400">Bio</h4>
            <p className="text-sm text-slate-700">{profile?.bio || 'No bio available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
