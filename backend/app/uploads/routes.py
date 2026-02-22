from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.role_required import role_required
from app.uploads.cloudinary_config import upload_file_to_cloudinary


uploads_bp = Blueprint("uploads", __name__, url_prefix="/api/uploads")


# 🔹 TEAM — Upload Proof File
@uploads_bp.route("/proof", methods=["POST"])
@role_required("TEAM")
def upload_proof():

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Upload to Cloudinary
    file_url = upload_file_to_cloudinary(file)

    if not file_url:
        return jsonify({"error": "Upload failed"}), 500

    return jsonify({
        "message": "File uploaded successfully",
        "file_url": file_url
    }), 200
