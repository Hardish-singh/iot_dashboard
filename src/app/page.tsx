import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Link href="/dashboard">
        <button className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow-lg hover:bg-gray-200 hover:scale-105 transition-all duration-300">
          Dashboard
        </button>
      </Link>
    </div>
  );
}