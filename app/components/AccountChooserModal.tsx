"use client";

export default function AccountChooserModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[360px] rounded-xl shadow-lg p-6">
        
        <h2 className="text-xl font-semibold mb-2">
          Choose an account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          to continue to Game of Creators
        </p>

        {/* TikTok */}
        <button
          onClick={() => (window.location.href = "/api/auth/tiktok")}
          className="w-full flex items-center gap-3 border rounded-lg p-3 mb-3 hover:bg-gray-100"
        >
          <img src="/tiktok.svg" className="w-6 h-6" />
          <span className="font-medium">Continue with TikTok</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => (window.location.href = "/api/auth/linkedin")}
          className="w-full flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-100"
        >
          <img src="/linkedin.svg" className="w-6 h-6" />
          <span className="font-medium">Continue with LinkedIn</span>
        </button>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500 mt-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
