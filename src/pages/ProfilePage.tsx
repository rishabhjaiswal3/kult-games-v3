import { Navigate } from "react-router-dom";

/** Profile merged into dashboard — keep route for bookmarks and nav redirects. */
const ProfilePage = () => <Navigate to="/dashboard" replace />;

export default ProfilePage;
