"use client"
import "./styles/Home.css";
import "./page.module.css"
import Navbar from "./components/Navbar.jsx";
import React from "react";
import { PiPaperPlaneTiltThin } from "react-icons/pi";
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';


export default function Home() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const navigateTo = (link) => {
      router.push(link);
  }
  
  return (
    <div className="home-main">
      <Navbar/>
      <div className="title-page">
        <div className="title-text">
          <h1>CoverCharm</h1>
          <h3>Expedite quality cover letters easily. Generate personalized covers for your dream company
            in seconds.
          </h3>
          {user ? <button className="start-btn" onClick={()=> {navigateTo("/profile")}}>
            Get Started
          </button> : <button className="start-btn" onClick={()=> {navigateTo("/api/auth/login")}}>
            Get Started
          </button>}
          
        </div>
        <div className="title-img">
          <div className="circle">
            <PiPaperPlaneTiltThin className="circle-icon"/>
          </div>
        </div>
      </div>
    </div>
  );
}
