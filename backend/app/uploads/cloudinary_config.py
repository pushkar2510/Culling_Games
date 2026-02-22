import cloudinary
import cloudinary.uploader
import cloudinary.utils


# Initialize Cloudinary
def init_cloudinary(app):

    cloudinary.config(
        cloud_name=app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=app.config.get("CLOUDINARY_API_KEY"),
        api_secret=app.config.get("CLOUDINARY_API_SECRET"),
        secure=True
    )


# Upload file and return correct URL
def upload_file_to_cloudinary(file, folder="culling_games_proofs"):

    try:

        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="auto"
        )

        public_id = result.get("public_id")
        resource_type = result.get("resource_type")
        format = result.get("format")

        secure_url = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            secure=True,
            format=format
        )[0]

        return secure_url

    except Exception as e:
        print("Cloudinary Upload Error:", str(e))
        return None
