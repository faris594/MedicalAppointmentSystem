import CompleteProfileForm from '../components/CompleteProfileForm';


export default function CompleteProfilePage() {
    const handleCompleteProfile = async (data: { phone: string; dob: string; city: string }) => {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/complete-profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to update profile");
        }

        // ✅ Redirect after successful profile completion
        window.location.href = "/dashboard";
    };

    return (
        <CompleteProfileForm onComplete={handleCompleteProfile} />
    );
}
