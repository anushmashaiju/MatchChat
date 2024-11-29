import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-blue-500 text-white p-4">
      <nav className="flex justify-between">
        <h1 className="text-xl font-bold">Match and Chat App</h1>
        <ul className="flex space-x-4 items-center">
          {user ? (
            <>
              <li>
                <span className="mr-2 font-bold text-xl">Welcome {user.username}!</span> {/* Display Username */}
              </li>
              <li>
                <Link to="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:underline">
                  Matches
                </Link>
              </li>
              <li>
                <button onClick={logout} className="hover:underline">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:underline">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
