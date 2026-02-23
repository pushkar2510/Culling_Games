# Firebase Auth manages all password hashing and credential verification.
# These helpers are no longer needed; kept as stubs to avoid import errors.


def hash_password(password):
    """Deprecated: Firebase Auth handles hashing internally."""
    raise NotImplementedError(
        "Use firebase_admin.auth.create_user() instead of hashing passwords manually."
    )


def verify_password(plain_password, hashed_password):
    """Deprecated: Firebase Auth handles verification via signInWithEmailAndPassword."""
    raise NotImplementedError(
        "Password verification is handled by Firebase Auth on the client."
    )
