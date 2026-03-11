import cv2
import numpy as np
import mediapipe as mp
import os

from app.face.model import get_face_embedding
from app.face.utils import cosine_similarity
from app.liveness.gaze_detector import get_eye_direction
from app.liveness.screen_detector import detect_screen

EMBED_STORAGE = "app/storage/embeddings"

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True
)

# stores current step
sessions = {}

# stores final results
completed_sessions = {}

THRESHOLD = 0.5


def verify_interview(unique_id, webcam_image):

    # if verification finished earlier → stop immediately
    if unique_id in completed_sessions:
        return completed_sessions[unique_id]

    # check if user exists
    embed_path = f"{EMBED_STORAGE}/{unique_id}.npy"

    if not os.path.exists(embed_path):
        return {"status": "User not found"}

    frame = cv2.imdecode(
        np.frombuffer(webcam_image, np.uint8),
        cv2.IMREAD_COLOR
    )

    h, w, _ = frame.shape

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        return {"status": "Face not detected"}

    landmarks = result.multi_face_landmarks[0].landmark

    xs = [lm.x for lm in landmarks]
    ys = [lm.y for lm in landmarks]

    x1 = int(min(xs) * w)
    y1 = int(min(ys) * h)
    x2 = int(max(xs) * w)
    y2 = int(max(ys) * h)

    # initialize session
    if unique_id not in sessions:
        sessions[unique_id] = "LOOK_LEFT"

    step = sessions[unique_id]

    direction = get_eye_direction(landmarks)

    # --------------------
    # STEP 1: LOOK LEFT
    # --------------------
    if step == "LOOK_LEFT":

        if direction == "LEFT":
            sessions[unique_id] = "LOOK_RIGHT"

            return {
                "status": "Look RIGHT",
                "face_box": [x1, y1, x2, y2]
            }

        return {
            "status": "Look LEFT",
            "face_box": [x1, y1, x2, y2]
        }

    # --------------------
    # STEP 2: LOOK RIGHT
    # --------------------
    if step == "LOOK_RIGHT":

        if direction == "RIGHT":
            sessions[unique_id] = "LOOK_CENTER"

            return {
                "status": "Look at the camera",
                "face_box": [x1, y1, x2, y2]
            }

        return {
            "status": "Look RIGHT",
            "face_box": [x1, y1, x2, y2]
        }

    # --------------------
    # STEP 3: LOOK CENTER
    # --------------------
    if step == "LOOK_CENTER":

        if direction == "CENTER":

            # screen spoof detection
            if detect_screen(frame):

                result = {"status": "Mobile screen detected"}

                sessions.pop(unique_id, None)
                completed_sessions[unique_id] = result

                return result

            stored_emb = np.load(embed_path)

            face = frame[y1:y2, x1:x2]

            face = cv2.resize(face, (112,112))

            current_emb = get_face_embedding(face)

            if current_emb is None:
                return {"status": "Face not clear"}

            similarity = cosine_similarity(stored_emb, current_emb)

            sessions.pop(unique_id, None)

            if similarity < THRESHOLD:

                result = {
                    "status": "Face verification failed",
                    "similarity": float(similarity)
                }

                completed_sessions[unique_id] = result

                return result

            result = {
                "status": "Verification successful",
                "similarity": float(similarity)
            }

            completed_sessions[unique_id] = result

            return result

        return {
            "status": "Look at the camera",
            "face_box": [x1, y1, x2, y2]
        }