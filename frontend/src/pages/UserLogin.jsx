import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
    };

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData);

    if (response.status === 200) {
      const data = response.data;
      setUser(data.user);
      localStorage.setItem('token', data.token);
      navigate('/home');
    }

    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">User Login</h2>
        <form
          onSubmit={(e) => {
            submitHandler(e);
          }}
        >
          <div className="mb-5">
            <label className="block text-lg font-medium mb-2">Email</label>
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              className="bg-gray-100 rounded-lg px-4 py-2 border w-full text-lg placeholder-gray-500"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-5">
            <label className="block text-lg font-medium mb-2">Password</label>
            <input
              className="bg-gray-100 rounded-lg px-4 py-2 border w-full text-lg placeholder-gray-500"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
              type="password"
              placeholder="password"
            />
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 w-full text-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4">
          New here?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create new Account
          </Link>
        </p>

        <div className="mt-6">
          <Link
            to="/captain-login"
            className="bg-green-600 hover:bg-green-700 flex items-center justify-center text-white font-semibold rounded-lg px-4 py-2 w-full text-lg"
          >
            Sign in as Captain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;