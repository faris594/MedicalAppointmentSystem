import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/router';

export default function GoogleLoginButton() {
    const router = useRouter();

    const handleSuccess = async (credentialResponse: any) => {
        const { credential } = credentialResponse;
        if (!credential) return;

        try {
            const res = await fetch("http://localhost:8080/api/auth/oauth-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            });

            const data = await res.json();
            console.log('OAuth login response:', data); // <-- add this to check

            if (data.token) {
                // Save token to localStorage or cookie
                localStorage.setItem('token', data.token);

                // Redirect based on incompleteProfile flag
                if (data.incompleteProfile) {
                    router.push('/complete-profile');
                } else {
                    router.push('/dashboard');
                }
            } else {
                console.error("Login failed:", data);
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("Google Login Failed")}
        />
    );
}
