import { useState } from "react";

const CustomTabs = ({setActiveTab,activeTab}) => {
//   const [activeTab, setActiveTab] = useState("applied");

  return (
    <div>
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("applied")}
          className={`px-4 py-2 ${activeTab === "applied" ? "border-b-2 border-blue-500 font-bold" : ""}`}
        >
          Applied Jobs
        </button>
        <button
          onClick={() => setActiveTab("ignored")}
          className={`px-4 py-2 ${activeTab === "ignored" ? "border-b-2 border-blue-500 font-bold" : ""}`}
        >
          Ignored Jobs
        </button>
             <button
          onClick={() => setActiveTab("hired")}
          className={`px-4 py-2 ${activeTab === "hired" ? "border-b-2 border-blue-500 font-bold" : ""}`}
        >
          Hired Jobs
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 ${activeTab === "logs" ? "border-b-2 border-blue-500 font-bold" : ""}`}
        >
          Logs
        </button>

      </div>

   
    </div>
  );
};

export default CustomTabs;
