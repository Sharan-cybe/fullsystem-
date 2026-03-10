from insightface.app import FaceAnalysis

face_model = None


def get_face_model():
    global face_model

    if face_model is None:

        face_model = FaceAnalysis(name="buffalo_l")
        face_model.prepare(ctx_id=0, det_size=(320, 320))

    return face_model


def get_face_embedding(image):

    model = get_face_model()

    faces = model.get(image)

    if len(faces) == 0:
        return None

    return faces[0].embedding