import {useState, useEffect} from "react";
import {format} from "date-fns";
import { api } from "../misc/api";
import { platformsBaseurl } from "../misc/config";
import { useNavigate } from "react-router-dom";


export function ProfileSubmission({username}) {
  const [submissions, setSubmissions] = useState([])
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate()
  useEffect(()=>{
    if(!username || username===undefined) return;
    api.getProfileSubmissions(username,page).then((res)=>{
      if(res.status==="SUCCESS"){
        setSubmissions([...submissions, ...res.result])
        setTotalSubmissions(res.total)
      }else{
        alert(res.message)
        //TODO: Refactor
        if(res.message==="Unauthorized") navigate("/login")
        if(res.message.toLowerCase()==="user not found") navigate("/profiles")
      }
    })
  },[page])
  return (
<div className="col-span-2 rounded p-4 border border-slate-200 shadow-sm text-sm flex flex-col">
      <h2 className="text-lg font-medium mb-3">Submissions</h2>
      <div className="overflow-y-auto h-80 border rounded">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Verdict</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.length > 0 ? (
              submissions.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{obj.platform}</td>
                  <td className="px-4 py-3">{obj.verdict}</td>
                  <td className="px-4 py-3">{obj.lang}</td>
                  <td className="px-4 py-3">
                    {format(obj.time*1000, "do MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`${platformsBaseurl[obj.platform]}${obj.submissionLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      link
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No submissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {page < Math.ceil(totalSubmissions / 10) && (
        <button 
          onClick={() => setPage(page + 1)}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors self-center"
        >
          Load more submissions
        </button>
      )}
    </div>
  );
}
