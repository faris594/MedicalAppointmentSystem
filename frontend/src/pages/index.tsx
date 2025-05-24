import Link from 'next/link';

export default function Home() {
  return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-800 to-teal-500">
        <div className="text-center bg-white bg-opacity-20 p-10 rounded-lg shadow-lg">
          <h1 className="text-5xl text-white font-bold mb-6">Medical Appointment System</h1>
          <div>
            <Link href="/login" className="text-lg text-blue-300 hover:text-blue-500">
              Login
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/register" className="text-lg text-green-300 hover:text-green-500">
              Register
            </Link>
          </div>
        </div>
      </div>
  );
}
