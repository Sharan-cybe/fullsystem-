import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { verifyInterview } from "../services/scripts_api";

const InterviewVerification = () => {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("Position your face");
  const [similarity, setSimilarity] = useState(null);
  const [running, setRunning] = useState(false);

  const verifiedRef = useRef(false);

  const drawFaceBox = (box) => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!box) return;

    const [x1, y1, x2, y2] = box;

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  };

  const captureFrame = async () => {
   

  console.log("captureFrame running");

  

    if (verifiedRef.current) return;

    try {

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const res = await fetch(imageSrc);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("unique_id", userId);
      formData.append("webcam_image", blob, "frame.jpg");
    console.log("Sending request to backend");
      const data = await verifyInterview(formData);

      console.log("Backend response:", data);

      setStatus(data.status);

      if (data.face_box) {
        drawFaceBox(data.face_box);
      }

      if (data.similarity !== undefined) {
        setSimilarity(data.similarity);
      }

      // stop after final result
      if (
        data.status.includes("Verification successful") ||
        data.status.includes("Face verification failed")
      ) {
        verifiedRef.current = true;
        setRunning(false);
        return;
      }

      // continue checking for blink
      requestAnimationFrame(captureFrame);

    } catch (error) {

      console.error(error);
      setStatus("Server error");
      setRunning(false);

    }
  };

  const startVerification = () => {

  console.log("Start button clicked");

  if (!userId) {
    setStatus("Enter your Unique ID");
    return;
  }

  verifiedRef.current = false;
  setSimilarity(null);
  setStatus("Please blink your eyes");
  setRunning(true);

  captureFrame();
};

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "40px",
        fontFamily: "Arial"
      }}
    >

      <h2>🎥 Interview Face Verification</h2>

      <input
        type="text"
        placeholder="Enter Unique ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value.toUpperCase())}
        style={{
          padding: "10px",
          fontSize: "16px",
          marginBottom: "20px"
        }}
      />

      <br />

      <div
        style={{
          position: "relative",
          width: "420px",
          margin: "auto"
        }}
      >

        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={420}
          audio={false}
          style={{
            borderRadius: "10px",
            border: "2px solid #444"
          }}
        />

        <canvas
          ref={canvasRef}
          width={420}
          height={315}
          style={{
            position: "absolute",
            top: 0,
            left: 0
          }}
        />

      </div>

      <br />

      <button
        onClick={startVerification}
        disabled={running}
        style={{
          padding: "12px 25px",
          fontSize: "16px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        {running ? "Verifying..." : "Start Verification"}
      </button>

      <div style={{ marginTop: "25px" }}>

        <h3>{status}</h3>

        {similarity !== null && (
          <p>
            Similarity Score:
            <strong> {Number(similarity).toFixed(3)}</strong>
          </p>
        )}

      </div>

    </div>
  );
};

export default InterviewVerification;