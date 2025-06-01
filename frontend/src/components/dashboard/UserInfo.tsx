interface UserInfoProps {
    userData: { name?: string; email?: string; phone?: string; dob?: string; city?: string } | null;
}

export default function UserInfo({ userData }: UserInfoProps) {
    const defaultUser = {
        name: 'not fetched',
        email: 'not fetched',
        phone: 'not fetched',
        dob: 'not fetched',
        city: 'not fetched',
    };

    const userInfo = userData ? {
        name: userData.name || defaultUser.name,
        email: userData.email || defaultUser.email,
        phone: userData.phone || defaultUser.phone,
        dob: userData.dob || defaultUser.dob,
        city: userData.city || defaultUser.city,
    } : defaultUser;

    const avatarUrl = userInfo.email
        ? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userInfo.email)}`
        : 'https://api.dicebear.com/7.x/notionists/svg';

    return (
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg flex items-center space-x-6">
            <img
                src={avatarUrl}
                alt="User Profile"
                className="w-32 h-32 rounded-full object-cover"
            />
            <div>
                <h2 className="text-xl font-semibold text-gray-800">{userInfo.name}</h2>
                <p className="text-gray-600">{userInfo.email}</p>
                <p className="text-gray-600">{userInfo.phone}</p>
                <p className="text-gray-600">DOB: {userInfo.dob}</p>
                <p className="text-gray-600">City: {userInfo.city}</p>
            </div>
        </div>
    );
}
