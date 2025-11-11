"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (isSignin) {
        // Sign In
        const res = await axios.post(`${HTTP_BACKEND}/api/v1/signin`, {
          username: email,
          password,
        });
        localStorage.setItem("token", res.data.token);
        setMessage("Signed in successfully!");
        // Redirect to rooms page after successful signin
        setTimeout(() => {
          router.push("/rooms");
        }, 500);
      } else {
        // Sign Up
        const res = await axios.post(`${HTTP_BACKEND}/api/v1/signup`, {
          username: email,
          password,
          name,
        });
        setMessage("Account created successfully! Please sign in.");
        // Redirect to signin page after successful signup
        setTimeout(() => {
          router.push("/signin");
        }, 1500);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-950">
      <div className="p-8 bg-[#1c2029] shadow-lg rounded-xl w-[360px]">
        <h1 className="text-2xl text-[#68707c] mb-4 text-center">
          {isSignin ? "Sign In" : "Create Account"}
        </h1>

        {/* For signup only */}
        {!isSignin && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Processing..." : isSignin ? "Sign In" : "Sign Up"}
        </button>

        {message && (
          <p
            className={`mt-3 text-center ${
              message.includes("success") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
