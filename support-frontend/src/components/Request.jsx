import React, { useState, useEffect } from "react";
import RequestCard from "./RequestCard";

export default function Request() {
  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(0);
  const [refresh, setRefresh] = useState(false);

  //fetch all requests from the server
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/api/getallrequests")
      .then((response) => response.json())
      .then((data) => setRequest(data))
      .catch((error) => console.error("Error fetching requests:", error))
      .finally(() => setLoading(false));
  }, [refresh]);

  const [pending, setPending] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [rejected, setRejected] = useState([]);

  function handleRefresh() {
    console.log("Refreshing the page...");
    setRefresh(!refresh);
    console.log("Refresh Completed!");
  }

  useEffect(() => {
    console.log("updated ", update);
    // Filter the requests based on their status
    const pendingRequests = request.filter((req) => req.status === "pending");
    const resolvedRequests = request.filter((req) => req.status === "resolved");
    const rejectedRequests = request.filter((req) => req.status === "rejected");

    setPending(pendingRequests);
    setResolved(resolvedRequests);
    setRejected(rejectedRequests);
  }, [request, update]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5 py-10">
        <h1 className="text-2xl font-bold mb-4">Support Requests</h1>
        <button
          className={`w-50 bg-blue-500 text-white mr-1 px-4 py-2 mb-5 rounded-md hover:bg-blue-600 cursor-pointer
                ${loading ? "" : ""}
                `}
          onClick={handleRefresh}
        >
          REFRESH
        </button>
        <div className="bg-white shadow-md rounded-lg p-6 w-full ">
          <h2 className="text-2xl  font-semibold mb-4">Pending Requests</h2>
          {loading && <p>Loading...</p>}
          {!loading && (
            <div className="flex flex-wrap items-center">
              {pending.length > 0 ? (
                pending.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    setUpdate={setUpdate}
                  />
                ))
              ) : (
                <p>No pending requests.</p>
              )}
            </div>
          )}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 w-full mt-4">
          <h2 className="text-2xl  font-semibold mb-4">Resolved Requests</h2>
          {loading && <p>Loading...</p>}
          {!loading && (
            <div className="flex flex-wrap items-center">
              {resolved.length > 0 ? (
                resolved.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))
              ) : (
                <p>No resolved requests.</p>
              )}
            </div>
          )}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 w-full mt-4">
          <h2 className="text-2xl  font-semibold mb-4">Rejected Requests</h2>
          {loading && <p>Loading...</p>}
          {!loading && (
            <div className="flex flex-wrap items-center">
              {rejected.length > 0 ? (
                rejected.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))
              ) : (
                <p>No rejected requests.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
