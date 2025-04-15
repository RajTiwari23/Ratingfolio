import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../components/misc/api';

export function ProfileSearchPage() {
  const inputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  function handleSubmit() {
    setSearchParams({ query: inputRef.current.value });
  }

  useEffect(() => {
    inputRef.current.value = searchParams.get('query');
    api.searchProfile(inputRef.current.value, page).then((res) => {
      if (res.status === "SUCCESS") {
        setProfiles(res.data.result);
      }else{
        alert(res.message);
      }
    })
  }, [searchParams, page]);
  function handleKeyDown(e){
    if(e.key === "Enter"){
      handleSubmit();
    }
  }
  useEffect(()=>{
    document.addEventListener('keydown', handleKeyDown)
    return ()=>{
      document.removeEventListener('keydown', handleKeyDown)

    }
  },[])
  console.log(profiles)
  return (
    <>
      <Header />
      <div className="min-h-[80vh]">
        <p className="py-2">Search Profile</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Username"
            className="border border-gray-200 text-sm rounded p-2"
          />
          <button onClick={() => handleSubmit()} className="bg-blue-500 text-white rounded px-4 py-2 text-sm">
            Search
          </button>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {profiles.length > 0 && profiles.map((obj) => (
            <li key={obj.id} className="bg-white rounded-lg shadow-sm p-4">
              <Link to={`/profile/${obj.user.username}`} className="block text-lg font-medium text-blue-600 hover:text-blue-800">
                {obj.user.name}
              </Link>
              <p className="text-sm text-gray-600">{obj.user.username}</p>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}
