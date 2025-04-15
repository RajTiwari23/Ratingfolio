import { Link } from 'react-router-dom';
export function Header() {
  const data = localStorage.getItem("userData");
  function handleLogout() {
    localStorage.removeItem("userData");
    window.location.reload();
  }
  return (
    <header className="flex items-center justify-between my-2 px-4 py-2 rounded border border-gray-200 shadow h-16 font-plex font-medium">
      <h1 className="text-xl font-bold"><Link to="/">Ratingfolio</Link></h1>
      <div className="flex items-center gap-10">
        <ul className="flex items-center gap-10 text-sm">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profiles">Search Profile</Link>
          </li>
         {data && <li>
            <Link to="/user/profile">User</Link>
          </li>}
         {!data && <li>
            <Link to="/login">Login</Link>
          </li>}
          {data && <li>
            <button onClick={handleLogout}>Logout</button>
          </li> }
        </ul>
      </div>
    </header>
  );
}
