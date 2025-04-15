import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom";
import { api } from "../misc/api";

import { platformsBaseurl } from "../misc/config";
export function ProfileContest({username}) {
  const [contests, setContests] = useState([])
  const [totalContests, setTotalContests] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate()
  useEffect(()=>{
    if(!username || username===undefined) return;
    api.getProfileContests(username,page).then((res)=>{
      if(res.status==="SUCCESS"){
        setContests([...contests, ...res.result])
        setTotalContests(res.total)
      }else{
        alert(res.message)
        if(res.message==="Unauthorized") navigate("/login")
        if(res.message.toLowerCase()==="user not found") navigate("/profiles")
      }
    })
  },[page])
  return (
<div className="row-span-2 border rounded p-4 border-slate-200 shadow-sm text-sm flex flex-col h-full">
      <h2 className="text-lg font-medium mb-3">Contests</h2>
      
      <div className="overflow-y-auto flex-grow flex flex-col gap-2 h-80">
        {contests.length > 0 ? (
          contests.map((obj) => (
            <div
              key={obj.id}
              className="border p-3 rounded-lg flex justify-between items-center bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
              <a
                href={`${platformsBaseurl[obj.contest.platform]}${obj.contest.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-base font-medium"
              >
                {obj.contest.name}
              </a>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {obj.contest.platform}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No contests found.</p>
          </div>
        )}
      </div>
      
      {page < Math.ceil(totalContests / 10) && (
        <button
          onClick={() => setPage(page + 1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors self-center"
        >
          Load more contests
        </button>
      )}
    </div>

  );
}
