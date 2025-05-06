import React from "react";

export default function Memory() {
  const [currentStatus, setCurrentStatus] = React.useState("Add to know more");
  const [currentValue, setCurrentValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setCurrentStatus("Loading...");

    try {
      //   let data = currentValue;
      //   data = JSON.parse(data);

      const data = { info: currentValue };

      console.log("Sending:", data);

      const response = await fetch("http://localhost:4000/api/addknowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      setCurrentValue("");
      setCurrentStatus("✅ Added to Knowledge Base");
      setTimeout(() => setCurrentStatus("Add to know more"), 3000);
    } catch (error) {
      console.error("Error:", error);
      setCurrentStatus("❌ Error adding to Knowledge Base");
      setTimeout(() => setCurrentStatus("Add to know more"), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-100 p-5 py-10">
        <h1 className="text-2xl font-bold mb-4">Add info to Knowledge Base</h1>
        <div className="bg-white shadow-md rounded-lg p-6 w-full ">
          {/* <h2 className="text-2xl  font-semibold mb-4">Knowledge Base</h2> */}
          <form
            className="flex flex-col items-center"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            {/* <input
              type="text"
              placeholder="Enter your question"
              className="border border-gray-300 rounded-md p-2 mb-4 w-full"
            /> */}
            <textarea
              placeholder="What do you want to add?"
              className="border border-gray-300 rounded-md p-2 mb-4 w-full h-32"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            ></textarea>
            <h2 className="mr-auto">Status: {currentStatus}</h2>
            <button className="bg-blue-500 text-white px-4 py-2 mt-1 rounded-md hover:bg-blue-600 cursor-pointer">
              Add to Knowledge Base
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
