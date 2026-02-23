import os
from dotenv import load_dotenv

load_dotenv()

import firebase_admin
from firebase_admin import credentials, auth, firestore

SUPER_ADMIN_EMAIL = "gamesburner10@gmail.com"
SUPER_ADMIN_PASSWORD = "burner10"
SUPER_ADMIN_NAME = "Super Admin"

cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

# Create or fetch the Firebase Auth user
try:
    user = auth.create_user(
        email=SUPER_ADMIN_EMAIL,
        password=SUPER_ADMIN_PASSWORD,
        display_name=SUPER_ADMIN_NAME,
    )
    print(f"Firebase Auth user created: {user.uid}")
except firebase_admin.exceptions.AlreadyExistsError:
    user = auth.get_user_by_email(SUPER_ADMIN_EMAIL)
    print(f"Firebase Auth user already exists: {user.uid}")

# Set MASTER custom claim
auth.set_custom_user_claims(user.uid, {"role": "MASTER"})
print("Custom claim set: role=MASTER")

# Create/update Firestore user document
db = firestore.client()
db.collection("users").document(user.uid).set({
    "uid": user.uid,
    "name": SUPER_ADMIN_NAME,
    "email": SUPER_ADMIN_EMAIL,
    "role": "MASTER",
    "is_active": True,
}, merge=True)
print(f"Firestore user doc written for uid: {user.uid}")
print("Super Admin setup complete!")
