"use client";
import Navlinks from '@/constants/navlinks';
import Link from 'next/link';
import { motion } from "motion/react"
import { cn } from "@/lib/utils";
import { useState } from 'react';

function App() {
  const [hoveredPath, setHoveredPath] = useState<string | null>("top");
  return (
    <div className="min-h-screen bg-gray-950">
      {/* <nav className="backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Pencil className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-white">DrawFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-white  font-medium transition-colors">
              <Link href="/signin">Sign In</Link>
              </button>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-all hover:shadow-lg font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      <div className="md:flex justify-center items-center hidden ">
        <div className="rounded-full mb-12 z-[10000000]  backdrop-blur-md  px-16 py-6 mt-3 ">
          <nav className="flex gap-[100px] relative justify-start w-full z-[100]  rounded-lg">
            {Navlinks.map((item, index) => {

              return (
                <Link
                  key={item.path}
                  className={`px-4 py-2 rounded-md text-sm lg:text-base relative no-underline duration-300 ease-in bg-transparent`}
                  href={item.path}
                  onMouseOver={() => setHoveredPath(item.to)}
                onMouseLeave={() => setHoveredPath("top")}
                >
                  <span
                    className={cn(
                      "font-jetbrain text-white  text-xl",
                      `${item.path === hoveredPath ? "text-white" : "text-white"}`,
                    )}
                  >
                    {item.name}
                  </span>
                  {  item.to === hoveredPath && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-full bg-indigo-600 rounded-full -z-10"
                      layoutId="navbar"
                      aria-hidden="true"
                      style={{
                        width: "100%",
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.25,
                        stiffness: 130,
                        damping: 9,
                        duration: 0.3,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Create Beautiful Diagrams
              <br />
              <span className="text-white">In Seconds</span>
            </h1>
            <p className="text-xl text-white mb-12 max-w-2xl mx-auto leading-relaxed">
              A powerful, intuitive drawing tool for sketching diagrams, wireframes, and visual ideas.
              Collaborate in real-time with your team.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-500 transition-all hover:shadow-xl font-semibold text-lg">
                Start Drawing Now
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
