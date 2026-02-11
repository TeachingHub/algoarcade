
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
import { AVAILABLE_AVATARS } from "@/utils/avatars";
import Divider from "@/components/shared/Divider";
import { CheckIcon } from "lucide-react";

export default function EditProfilePage() {
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setUsername(user.displayName || "");
    setSelectedAvatar(user.photoURL || AVAILABLE_AVATARS[0]);
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
        username,
        photoURL: selectedAvatar
      });
      await refreshUserProfile();
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
        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>USERNAME</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <Divider size="xlarge" thickness="medium" />

          <div className={styles.inputGroup}>
            <label className={styles.label}>PROFILE PICTURE</label>
            <div className={styles.avatarGrid}>
              {AVAILABLE_AVATARS.map((avatar) => (
                <div
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.selected : ''}`}
                >
                  <img
                    src={avatar}
                    alt="Avatar option"
                    className={styles.avatarImg}
                  />
                  {selectedAvatar === avatar && (
                    <div className={styles.checkIcon}>
                      <CheckIcon size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider size="xlarge" thickness="medium" />

        <div className={styles.options}>
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