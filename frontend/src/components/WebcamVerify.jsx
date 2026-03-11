import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import API from "../api/api";

export default function WebcamVerify() {

  const webcamRef = useRef(null);

  const [uniqueId, setUniqueId] = useState("");
  const [status, setStatus] = useState("START");
  const [verified, setVerified] = useState(false);

  const sendFrame = async () => {

    if (!webcamRef.current || verified) return;

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then(res => res.blob());

    const formData = new FormData();

    formData.append("unique_id", uniqueId);
    formData.append("webcam_image", blob);

    try {

      const res = await API.post("/verify-interview", formData);

      console.log("Backend:", res.data);

      setStatus(res.data.status);

      if (res.data.status === "VERIFIED") {

        setVerified(true);

        console.log("Face verified");

      }

    } catch (err) {

      console.log(err.response?.data);

    }
  };

  useEffect(() => {

    const interval = setInterval(sendFrame, 1500);

    return () => clearInterval(interval);

  }, [uniqueId, verified]);

  return (

    <div style={{textAlign:"center"}}>

      <h2>Live Identity Verification</h2>

      <input
        placeholder="Enter Unique ID"
        onChange={(e)=>setUniqueId(e.target.value)}
      />

      <div style={{position:"relative", width:"500px", margin:"auto"}}>

        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={500}
        />

        {/* face box */}
        <div
          style={{
            position:"absolute",
            border:"3px solid lime",
            width:"220px",
            height:"220px",
            top:"70px",
            left:"140px",
            borderRadius:"10px"
          }}
        />

      </div>

      <h3>

        {status === "START" && "Align your face inside the box"}
        {status === "LOOK_LEFT" && "Look Left"}
        {status === "LOOK_RIGHT" && "Look Right"}
        {status === "LOOK_CENTER" && "Look Center"}
        {status === "PROCESSING" && "Verifying face"}
        {status === "VERIFIED" && "Verification Successful"}

      </h3>

    </div>
  );
}