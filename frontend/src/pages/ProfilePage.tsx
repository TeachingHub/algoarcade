import Layout from "../layouts/Layout";
import { useAuth } from "../context/AuthContext";
import Button from "@/components/shared/Button";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <Layout>
            <div style={{ padding: "2rem", color: "white" }}>
                <h1>Profile</h1>
                <p><strong>Username:</strong> {user?.displayName || "N/A"}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <div style={{ marginTop: "2rem" }}>
                    <Button style={["secondary"]} label="LOGOUT" onClick={handleLogout} />
                </div>
            </div>
        </Layout>
    );
}
