export const Loader = ({ fullscreen = false }) => (
  <div
    className={`flex items-center justify-center ${
      fullscreen ? 'fixed inset-0 bg-black z-50' : 'w-full py-12'
    }`}
  >
    <span className="w-5 h-5 rounded-full border border-zinc-600 border-t-white animate-spin" />
  </div>
);