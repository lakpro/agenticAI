import React from "react";

export default function RequestCard({ request }) {
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
        <strong>User:</strong> {request.userName}
      </p>
      <p>
        <strong>Question:</strong> {request.question}
      </p>
      <p>
        <strong>Status:</strong> {request.status}
      </p>
      {request.status === "pending" && (
        <div className="flex justify-between mt-4">
          <button className="w-50 bg-blue-500 text-white mr-1 px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer">
            Resolve
          </button>
          <button className="w-50 bg-red-500 text-white ml-1 px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer">
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
