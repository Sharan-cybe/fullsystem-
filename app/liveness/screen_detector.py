import cv2


def detect_screen(frame):

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    # phone screens usually produce low variance
    if lap_var < 80:
        return True

    return False