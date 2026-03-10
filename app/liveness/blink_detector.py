LEFT_EYE_TOP = 159
LEFT_EYE_BOTTOM = 145

def detect_blink(landmarks):

    top = landmarks[LEFT_EYE_TOP].y
    bottom = landmarks[LEFT_EYE_BOTTOM].y

    ear = abs(top - bottom)

    # better threshold
    if ear < 0.018:
        return True

    return False