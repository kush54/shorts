



// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchScriptAsync, selectGeneratedScript } from "./startSlice";
// import { fetchScript } from "./startApi";
// import axios from "axios"

// const GenerateScript = () => {
//     const dispatch = useDispatch();
//     const genretaedScript = useSelector(selectGeneratedScript) 
//   const [scriptOutput, setScriptOutput] = useState(
//     "Your generated script will appear here."
//   );
//   const [speechOutput, setSpeechOutput] = useState("");
//   const [scriptInput, setScriptInput] = useState("");
//   const [selectedVideos, setSelectedVideos] = useState({});
//   const [mergedVideoUrl, setMergedVideoUrl] = useState(null); // For displaying the merged video
//   const [vidText,setVidText] = useState(null)
//   const handleGenerateScript = () => {
//      dispatch(fetchScriptAsync({prompt:search})) ;  
//   };
//   const [search,setSearch] = useState(null);
 

//   const handleTextToSpeech = () => {
//     // Placeholder function for text-to-speech conversion (to be integrated with backend/AI model).
//     // setSpeechOutput("Speech synthesis in progress...");
//   };
//   const [vidData,setVidData] = useState([])

//   const handleFindVideos = async() => {
//     try {
//       const query = vidText
//       const response = await axios.get(`http://localhost:5000/api/search?query=${query}`);
//       console.log(response.data.videos)
//       setVidData(response.data.videos)
//     } catch (error) {
//       console.log(error)
//     }
//   };
//   console.log(vidData)

//   const handleCheckboxChange = (index) => {
//     setSelectedVideos((prevState) => ({
//       ...prevState,
//       [index]: !prevState[index], // Toggle selection for the video at this index
//     }));
//   };
  
  
//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Navbar Section */}
//       <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-lg z-50">
//         <div className="container mx-auto flex justify-between items-center px-6 py-4">
//           <div className="text-3xl font-bold text-yellow-400">CK</div>
//           <div className="space-x-8 text-lg font-medium">
//             <a href="/" className="hover:text-yellow-400 transition-all duration-300">
//               Home
//             </a>
//             <a href="/generate-script" className="hover:text-yellow-400 transition-all duration-300">
//               Generate Script
//             </a>
//             <a href="/features" className="hover:text-yellow-400 transition-all duration-300">
//               Features
//             </a>
//             <a href="/contact" className="hover:text-yellow-400 transition-all duration-300">
//               Contact
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* Content Section */}
//       <div className="pt-20 px-8 flex flex-col items-center justify-center">
//         <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
//           {/* Left Image */}
//           <div className="w-full lg:w-1/2">
//             <img
//               src="https://cdn-icons-png.flaticon.com/512/3131/3131621.png"
//               alt="Script Writing"
//               className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
//               style={{ width: "60%" }}
//             />
//           </div>

//           {/* Right Content */}
//           <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left">
//             <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slideInUp">
//               Generate Your Script Instantly
//             </h1>
//             <p className="text-lg text-gray-400 mb-8 animate-fadeIn">
//               Enter your topic below, and our AI will create a script for you in seconds.
//             </p>
//             <div className="w-full flex flex-col gap-4 animate-fadeIn delay-200">
//               <input
//                 type="text"
//                 onChange={e=>setSearch(e.target.value)}
//                 placeholder="Enter topic for your script"
//                 className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
//               />
//               <button
//                 onClick={handleGenerateScript}
//                 className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
//               >
//                 Generate Script
//               </button>
//             </div>
//             <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg shadow-lg animate-fadeIn">
//               <h2 className="text-xl font-semibold mb-3 text-yellow-400">Output</h2>
//               <div className="w-full h-40 overflow-y-auto p-3 bg-gray-700 rounded-lg text-gray-300 whitespace-pre-line">
//                 {scriptOutput || "Your script will appear here once generated."}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Divider Line */}
//         <div className="w-full h-px bg-gray-700 my-12"></div>
//         <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
//           {/* Left Image */}
//           <div className="w-full lg:w-1/2">
//             <img
//               src="https://cdn-icons-png.flaticon.com/512/8984/8984813.png"
//               alt="Text-to-Speech"
//               className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
//               style={{ width: "80%" }}
//             />
//           </div>

//           {/* Right Content */}
//           <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left">
//             <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slideInUp">
//               Convert Text to Speech
//             </h1>
//             <p className="text-lg text-gray-400 mb-8 animate-fadeIn">
//               Paste your text below, and our AI will convert it into lifelike speech.
//             </p>
//             <div className="w-full flex flex-col gap-4 animate-fadeIn delay-200">
//               <textarea
//                 rows="4"
//                 placeholder="Enter text to convert to speech"
//                 className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
//               ></textarea>
//               <button
//                 onClick={handleTextToSpeech}
//                 className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
//               >
//                 Convert to Speech
//               </button>
//             </div>
//             <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg shadow-lg animate-fadeIn">
//               <h2 className="text-xl font-semibold mb-3 text-yellow-400">Output</h2>
//               <div className="w-full h-40 overflow-y-auto p-3 bg-gray-700 rounded-lg text-gray-300 whitespace-pre-line">
//                 {speechOutput || "Speech output will appear here."}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Video Suggestions Section */}
//         <div className="w-full h-px bg-gray-700 my-12"></div>
// <div className="container mx-auto">
//   <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slideInUp text-center">
//     Relevant Videos for Your Script
//   </h1>
//   <p className="text-lg text-gray-400 mb-8 animate-fadeIn text-center">
//     Discover videos tailored to each sentence in your script.
//   </p>
//   <div className="w-full flex flex-col gap-4 mb-6">
//     <input
//       type="text"
//       value={vidText}
//       onChange={(e) => setVidText(e.target.value)}
//       placeholder="Enter your script here"
//       className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
//     />
//   </div>

//   <div className="mb-12">
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//       {vidData.map((vid, index) => (
//         <div
//           key={index}
//           className="bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
//         >
//           <video
//             src={vid.video_files[0].link}
//             autoPlay
//             loop
//             muted
//             alt={`Video suggestion ${index} for sentence ${index + 1}`}
//             className="w-full h-40 object-cover rounded-t-lg"
//           />
//           <div className="p-4 text-center">
//             <p className="text-sm text-gray-300">
//               Video {index + 1} for this sentence.
//             </p>
//             <input
//               type="checkbox"
//               checked={selectedVideos[index] || false}
//               onChange={() => handleCheckboxChange(index)}
//               className="mt-2"
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>

//   <button
//     onClick={handleFindVideos}
//     className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
//   >
//     Find Videos
//   </button>
// </div>


      
      
//         <div className="w-full h-px bg-gray-700 my-12"></div>

//       </div>
      
//     </div>
    
//   );
// };

// export default GenerateScript;




import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchScriptAsync, selectGeneratedScript } from "./startSlice";
import { fetchScript } from "./startApi";
import axios from "axios";

const GenerateScript = () => {
  const dispatch = useDispatch();
  const generatedScript = useSelector(selectGeneratedScript);
  const [scriptOutput, setScriptOutput] = useState(
    "Your generated script will appear here."
  );
  const [speechOutput, setSpeechOutput] = useState("");
  const [scriptInput, setScriptInput] = useState("");
  const [selectedVideos, setSelectedVideos] = useState({}); // Selected video index
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null); // For displaying merged video URL
  const [vidText, setVidText] = useState(null); // Input text for finding videos
  const [vidData, setVidData] = useState([]); // For storing fetched videos
  const [uploadedVideos, setUploadedVideos] = useState([]); // For storing user-uploaded videos
  const [search, setSearch] = useState(""); // For the script generation search prompt

  const handleGenerateScript = () => {
    dispatch(fetchScriptAsync({ prompt: search }));
  };

  const handleTextToSpeech = () => {
    // Placeholder function for text-to-speech conversion (to be integrated with backend/AI model).
    // setSpeechOutput("Speech synthesis in progress...");
  };

  const handleFindVideos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/search?query=${vidText}`);
      setVidData(response.data.videos);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadVideo = (videoUrl, filename) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = filename;
    link.click();
  };
  

  const handleCheckboxChange = (index) => {
    setSelectedVideos((prevState) => ({
      ...prevState,
      [index]: !prevState[index], // Toggle selection for the video at this index
    }));
  };
  console.log(selectedVideos,"sv")
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setUploadedVideos((prev) => [...prev, videoURL]);
    }
  };

  const handleIntegrateVideos = () => {
    const videosToMerge = [
      ...selectedVideos.map((index) => vidData[index].video_files[0].link),
      ...uploadedVideos,
    ];

    console.log("Videos to merge:", videosToMerge);
    // Integrate and merge the videos (either on the frontend using ffmpeg.js or send to the backend for merging)
    // Use a backend service to handle video merging or use ffmpeg.js for client-side merging.
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  console.log(generatedScript)
 console.log("generated script",generatedScript?.candidates[0].content.parts[0].text)
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar Section */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <div className="text-3xl font-bold text-yellow-400">CK</div>

        {/* Hamburger Icon for Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-yellow-400 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`lg:flex lg:space-x-8 text-lg font-medium absolute lg:static top-16 left-0 w-full lg:w-auto bg-gray-900 lg:bg-transparent transition-all transform ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <a
            href="/"
            className="block lg:inline-block py-2 px-4 lg:py-0 hover:text-yellow-400 transition-all duration-300"
          >
            Home
          </a>
          <a
            href="/generate-script"
            className="block lg:inline-block py-2 px-4 lg:py-0 hover:text-yellow-400 transition-all duration-300"
          >
            Generate Script
          </a>
          <a
            href="/features"
            className="block lg:inline-block py-2 px-4 lg:py-0 hover:text-yellow-400 transition-all duration-300"
          >
            Features
          </a>
          <a
            href="/contact"
            className="block lg:inline-block py-2 px-4 lg:py-0 hover:text-yellow-400 transition-all duration-300"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>

      {/* Content Section */}
      <div className="pt-20 px-8 flex flex-col items-center justify-center">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left Image */}
          <div className="w-full lg:w-1/2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3131/3131621.png"
              alt="Script Writing"
              className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
              style={{ width: "60%" }}
            />
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slideInUp">
              Generate Your Script Instantly
            </h1>
            <p className="text-lg text-gray-400 mb-8 animate-fadeIn">
              Enter your topic below, and our AI will create a script for you in seconds.
            </p>
            <div className="w-full flex flex-col gap-4 animate-fadeIn delay-200">
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter topic for your script"
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
              <button
                onClick={handleGenerateScript}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
              >
                Generate Script
              </button>
            </div>
            <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg shadow-lg animate-fadeIn">
              <h2 className="text-xl font-semibold mb-3 text-yellow-400">Output</h2>
              <div className="w-full h-40 overflow-y-auto p-3 bg-gray-700 rounded-lg text-gray-300 whitespace-pre-line">
                {generatedScript?.candidates[0].content.parts[0].text || "Your script will appear here once generated."}
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-gray-700 my-12"></div>
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
       {/* Left Image */}
       <div className="w-full lg:w-1/2">
             <img
              src="https://cdn-icons-png.flaticon.com/512/8984/8984813.png"
              alt="Text-to-Speech"
              className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
              style={{ width: "80%" }}
            />
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slideInUp">
              Convert Text to Speech
            </h1>
            <p className="text-lg text-gray-400 mb-8 animate-fadeIn">
              Paste your text below, and our AI will convert it into lifelike speech.
            </p>
            <div className="w-full flex flex-col gap-4 animate-fadeIn delay-200">
              <textarea
                rows="4"
                placeholder="Enter text to convert to speech"
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              ></textarea>
              <button
                onClick={handleTextToSpeech}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
              >
                Convert to Speech
              </button>
            </div>
            <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg shadow-lg animate-fadeIn">
              <h2 className="text-xl font-semibold mb-3 text-yellow-400">Output</h2>
              <div className="w-full h-40 overflow-y-auto p-3 bg-gray-700 rounded-lg text-gray-300 whitespace-pre-line">
                {speechOutput || "Speech output will appear here."}
              </div>
            </div>
          </div>
        </div>

        {/* Video Suggestions Section */}
        <div className="w-full h-px bg-gray-700 my-12"></div>

        <div className="container mx-auto">
  <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slideInUp text-center">
    Relevant Videos for Your Script
  </h1>
  <p className="text-lg text-gray-400 mb-8 animate-fadeIn text-center">
    Discover videos tailored to each sentence in your script.
  </p>
  <div className="w-full flex flex-col gap-4 mb-6">
    <input
      type="text"
      value={vidText}
      onChange={(e) => setVidText(e.target.value)}
      placeholder="Enter your script here"
      className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
    />
  </div>

  <div className="mb-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {vidData.map((vid, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
        >
          <video
            src={vid.video_files[0].link}
            autoPlay
            loop
            muted
            alt={`Video suggestion ${index} for sentence ${index + 1}`}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          <div className="p-4 text-center">
            {/* <p className="text-sm text-gray-300">Video {index + 1} for this sentence.</p>
            <input
              type="checkbox"
              checked={selectedVideos[index] || false}
              onChange={() => handleCheckboxChange(index)}
              className="mt-2"
            /> */}
            <button
              onClick={() => handleDownloadVideo(vid.video_files[0].link, `video_${index + 1}.mp4`)}
              className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
            >
              Download Video
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>

  <button
    onClick={handleFindVideos}
    className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transform hover:scale-105 transition-transform duration-300"
  >
    Find Videos
  </button>
</div>


        
      </div>
    </div>
  );
};

export default GenerateScript;

