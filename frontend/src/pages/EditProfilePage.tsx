import Layout from "@/layouts/Layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import styles from "@/styles/components/forms/Form.module.css";
import { updateUserProfile } from "@/services/authService";
import { validateUsernameAvailability } from "@/services/validationService";
import FormWrapper from "@/components/forms/FormWrapper";

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setUsername(user.displayName || "");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {

      if (username !== user.displayName) {
        const usernameAvailable = await validateUsernameAvailability(username);
        if (!usernameAvailable) throw new Error("Username is not available");
      }

      await updateUserProfile(user, {
        username
      });
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <FormWrapper
        title="EDIT PROFILE"
        subtitle={<>Update your personal<br />information</>}
        onSubmit={handleSubmit}
        error={error}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className={styles.label}>USERNAME</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button
            style={["secondary"]}
            label="CANCEL"
            onClick={() => navigate("/profile")}
            type="button"
          />
          <Button
            style={["primary"]}
            label={loading ? "SAVING..." : "SAVE CHANGES"}
            type="submit"
            disabled={loading}
          />
        </div>
      </FormWrapper>
    </Layout>
  );
}