import React from 'react'
import { api } from '../misc/api';
import { platformsPics } from '../misc/config';
import { useModal } from '../provider/ModalProvider';
import {CirclePower} from 'lucide-react'

export function UserPlatform(){
    const [platforms, setPlatforms] = React.useState([]);
    const context = useModal();
    React.useEffect(()=>{
      api.getUserPlatforms().then((res)=>{
        if(res.status==="SUCCESS"){
          setPlatforms(res.data)
        }else{
            console.error(res.message)
        }
      })  
    },[])

    return (
        <div className="flex flex-col w-96 gap-2    ">
            <h4 className="text-lg font-bold"> Platforms</h4>
            {platforms.map((obj) => (
                <div key={obj.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <img src={platformsPics[obj.platform]} alt={obj.platform} className="w-8 h-8" />
                <div className="flex flex-col">
                    <h3 className="font-medium text-lg">{obj.platform}</h3>
                    <p className="text-sm text-slate-600">{obj.username}</p>
                </div>
                </div>
            ))}
            <button onClick={context.toggleModal} className="bg-slate-100 px-6 py-2 rounded text-slate-900 text-sm font-medium hover:bg-slate-200 transition">Add Platform</button>
            <PlatformModal platforms={platforms} />
        </div>
    )
}
const PLATFORM_OPTIONS = [
    { value: "codechef", label: "Codechef" },
    { value: "codeforces", label: "Codeforces" },
  ];
function PlatformModal({platforms}){
    const context = useModal();
const [platform, setPlatform] = React.useState("");
const [username, setUsername] = React.useState("");

function handleSubmit(data) {
  const formData = new FormData(data);
  const finalPlatform = formData.get("platform");
  const finalUsername = formData.get("username");

  const payload = {
    username: finalUsername,
    platform: finalPlatform,
  };

  api.postUserPlatforms(payload).then((res) => {
    if (res.status === "SUCCESS") {
      console.log(res.message);
      context.toggleModal();
    } else {
      console.error(res.message);
    }
  });

  console.log("Submitted:", {
    platform: finalPlatform,
    username: finalUsername,
  });
}

React.useEffect(() => {
  // reset state when modal opens
  if (context.isOpen) {
    setPlatform("");
    setUsername("");
  }
}, [context.isOpen]);

return (
  <div
    className={`${
      context.isOpen ? "block" : "hidden"
    } fixed z-50 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white shadow-xl rounded-xl p-6`}
  >
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-xl font-semibold">Add Platform</h4>
      <button
        onClick={context.toggleModal}
        className="text-slate-500 hover:text-slate-800"
      >
        <CirclePower />
      </button>
    </div>

    {/* Form */}
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e.target);
      }}
      className="flex flex-col gap-4"
    >
      {/* Platform select */}
      <div className="flex flex-col">
        <label htmlFor="platform" className="text-sm font-medium mb-1">
          Platform
        </label>
        <select
          id="platform"
          name="platform"
          className="border rounded-md p-2"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="">-- Select platform --</option>
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Username input */}
      <div className="flex flex-col">
        <label htmlFor="username" className="text-sm font-medium mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className="border rounded-md p-2"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-md py-2 px-4 text-sm font-semibold transition"
      >
        Save
      </button>
    </form>
  </div>
);
}