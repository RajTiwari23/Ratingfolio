import React from "react";
import { api } from "../misc/api";

export function UpdateProfile() {
  const [profile, setProfile] = React.useState({})
  const [loading, setLoading] = React.useState(true);
  React.useEffect(()=>{
    api.getUserData().then((res)=>{
      console.log(res)
      if(res.status==="SUCCESS"){
        setLoading(false)
        setProfile(res.data)
      }else
        alert(res.message)
    })
  },[])
  function handleProfileCreation(data){
    const formdata = new FormData(data);
    const post_data = {
      name: formdata.get("name"),
      bio: formdata.get("bio")
    }
    api.postProfileData(post_data).then((res)=>{
      if(res.status==="SUCCESS"){
        alert(res.data.message)
      }else{
        alert(res.message)
      }
    })
  }
  function handleProfileUpdate(data){
    const formdata = new FormData(data);
    const patch_data = {
      
    }
    if(formdata.get("bio")) patch_data.bio = formdata.get("bio")
    if(formdata.get("name")) patch_data.name = formdata.get("name")
    api.patchProfileData(profile.id, patch_data).then((res)=>{
      console.log(res)
      if(res.status==="SUCCESS"){
        alert(res.data.message)
      }else{
        alert(res.message)
      }
    })
  }
  if(loading){
    return <div>Loading...</div>
  }
  if(!profile){
    return <div className="max-w-md mt-10 p-6 bg-white rounded-xl shadow-md">
    <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
      Profile Creation
    </h3>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleProfileCreation(e.target);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Name:
        </label>
        <input
          type="text"
          name="name"
          id="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
  
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">
          Bio:
        </label>
        <textarea
          name="bio"
          id="bio"
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
  
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  </div>
  }
  console.log(profile)
  return <div className="max-w-md mt-10 p-6 bg-white rounded-xl shadow-md">
  <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
    Update Profile
  </h3>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleProfileUpdate(e.target);
    }}
    className="space-y-4"
  >
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Name:
      </label>
      <input
        type="text"
        name="name"
        id="name"
        defaultValue={profile?.user.name}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label
        htmlFor="bio"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Bio:
      </label>
      <textarea
        name="bio"
        id="bio"
        defaultValue={profile?.bio}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
    </div>

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
    >
      Update
    </button>
  </form>
</div>;
}
