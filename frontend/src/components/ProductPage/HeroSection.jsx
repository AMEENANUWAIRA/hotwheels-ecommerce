// frontend/src/components/ProductPage/HeroSection.jsx
export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Collect Your Passion</h1>
        <p className="text-xl text-blue-100 mb-8">
          Discover the ultimate collection of Hot Wheels toys and collectibles
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
            Shop Now
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            View Collections
          </button>
        </div>
      </div>
    </div>
  );
}