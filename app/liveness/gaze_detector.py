import numpy as np

LEFT_EYE_LEFT = 33
LEFT_EYE_RIGHT = 133
LEFT_IRIS = 468


def get_eye_direction(landmarks):

    iris_x = landmarks[LEFT_IRIS].x
    left = landmarks[LEFT_EYE_LEFT].x
    right = landmarks[LEFT_EYE_RIGHT].x

    ratio = (iris_x - left) / (right - left)

    if ratio < 0.35:
        return "LEFT"

    elif ratio > 0.65:
        return "RIGHT"

    else:
        return "CENTER"