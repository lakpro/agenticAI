import React, { useState } from "react";

export default function RequestCard({ request, setUpdate }) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("NA");

  async function markResolved(id) {
    setLoading(true);
    setCurrentStatus("marking resolved ...");
    try {
      console.log("Marking resolved:", id);

      const response = await fetch(`http://localhost:4000/api/mark_resolved`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req_id: id }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response}`);
      }

      setCurrentStatus("✅ RESOLVED");
      request.status = "resolved";
      setUpdate(id);
    } catch (error) {
      console.error("Error:", error);
      setCurrentStatus("❌ NOT RESOLVED");
    } finally {
      setLoading(false);
    }
  }

  async function markRejected() {
    const id = request.id;
    setLoading(true);
    setCurrentStatus("marking rejected ...");
    try {
      console.log("Marking rejected:", id);

      const response = await fetch(`http://localhost:4000/api/mark_rejected`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req_id: id }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response}`);
      }

      setCurrentStatus("✅ RESOLVED");
      request.status = "rejected";
      setUpdate(id);
    } catch (error) {
      console.error("Error:", error);
      setCurrentStatus("❌ NOT RESOLVED");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    setLoading(true);
    setCurrentStatus("...");
    try {
      console.log("Sending resolve:", request.id);

      const response = await fetch(`http://localhost:4000/api/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req_id: request.id }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      const returned = result.agentResponse.status;
      if (returned == "accepted") {
        // setCurrentStatus("✅ RESOLVED");
        markResolved(request.id);
      } else setCurrentStatus("❌ NOT RESOLVED");
    } catch (error) {
      console.error("Error:", error);
      setCurrentStatus("❌ NOT RESOLVED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`w-xs m-4 p-4 border rounded-md 
    ${
      request.status === "pending"
        ? "bg-amber-100"
        : request.status === "resolved"
        ? "bg-lime-100"
        : "bg-rose-100"
    }
    shadow-md`}
    >
      <p>
        <strong>Req Id:</strong> {request.id}
      </p>
      <p>
        <strong>User:</strong> {request.userName}
      </p>
      <p>
        <strong>Question:</strong> {request.question}
      </p>
      <p>
        <strong>Status:</strong> {request.status}
      </p>

      {request.status === "pending" && (
        <>
          <p>
            <strong>Resolved Status:</strong> {currentStatus}
          </p>
          <div className="flex justify-between mt-4">
            <button
              className={`w-50 bg-blue-500 text-white mr-1 px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer
                ${loading ? "" : ""}
                `}
              onClick={handleResolve}
            >
              {loading && <p>Loading...</p>}
              {!loading && <p>Resolve</p>}
            </button>
            <button
              className="w-50 bg-red-500 text-white ml-1 px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
              onClick={markRejected}
            >
              {loading && <p>Loading...</p>}
              {!loading && <p>Reject</p>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
