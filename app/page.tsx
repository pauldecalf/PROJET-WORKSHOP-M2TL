import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Workshop IoT</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/public/rooms" 
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Dashboard Public
            </Link>
            <Link 
              href="/api-docs" 
              className="text-gray-600 hover:text-gray-900 transition"
            >
              API Docs
            </Link>
            <Link 
              href="/admin/login" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Système IoT de
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"> Gestion de Salles</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Surveillez en temps réel la température, l'humidité, le CO2, le bruit et la luminosité de vos salles connectées.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/public/rooms"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              📊 Voir les salles disponibles
            </Link>
            <Link 
              href="/api-docs"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition border-2 border-gray-200"
            >
              📚 Documentation API
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Données en temps réel</h3>
            <p className="text-gray-600">
              Température, humidité, CO2, décibels et luminosité mesurés en continu par nos capteurs ESP32.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🏠</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Gestion des salles</h3>
            <p className="text-gray-600">
              Consultez la disponibilité des salles et leur état en temps réel depuis n'importe où.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🔖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Contrôle NFC</h3>
            <p className="text-gray-600">
              Badges NFC pour l'accès aux salles et la gestion des devices avec traçabilité complète.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold text-center mb-12">
            Notre infrastructure IoT
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">31</div>
              <div className="text-blue-100">Routes API</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">12</div>
              <div className="text-blue-100">Modèles de données</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">5</div>
              <div className="text-blue-100">Types de capteurs</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Technologies utilisées
        </h2>
        
        <div className="grid md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-3">⚛️</div>
            <div className="font-semibold">Next.js 16</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-3">🍃</div>
            <div className="font-semibold">MongoDB</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-3">🔒</div>
            <div className="font-semibold">JWT Auth</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-3">📟</div>
            <div className="font-semibold">ESP32</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-3">📚</div>
            <div className="font-semibold">Swagger</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Prêt à explorer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Consultez le dashboard public ou connectez-vous à l'espace administrateur pour gérer votre infrastructure IoT.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/public/rooms"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition"
            >
              Dashboard Public
            </Link>
            <Link 
              href="/admin/login"
              className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition"
            >
              Espace Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="text-center text-gray-600">
          <p className="mb-2">
            © 2025 Workshop IoT - Système de gestion de salles connectées
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/api-docs" className="hover:text-gray-900 transition">
              API Documentation
            </Link>
            <Link href="/public/rooms" className="hover:text-gray-900 transition">
              Dashboard Public
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
