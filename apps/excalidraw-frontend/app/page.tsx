import { Pencil, Layers, Share2, Zap, Users, Lock } from 'lucide-react';
import Link from 'next/link';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Pencil className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">DrawFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              <Link href="/signin">Sign In</Link>
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Create Beautiful Diagrams
              <br />
              <span className="text-blue-600">In Seconds</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A powerful, intuitive drawing tool for sketching diagrams, wireframes, and visual ideas.
              Collaborate in real-time with your team.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all hover:shadow-xl font-semibold text-lg">
                Start Drawing Now
              </button>
              <button className="bg-white text-slate-700 px-8 py-4 rounded-lg hover:bg-slate-50 transition-all border-2 border-slate-200 font-semibold text-lg">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="mt-20 bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Layers className="w-24 h-24 text-blue-600 mx-auto mb-4 opacity-40" />
                <p className="text-slate-400 text-lg">Canvas Preview</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-slate-600">
                Powerful features for seamless diagramming
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
                <p className="text-slate-600 leading-relaxed">
                  Instant load times and smooth performance. Create complex diagrams without any lag or delays.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Collaboration</h3>
                <p className="text-slate-600 leading-relaxed">
                  Work together with your team in real-time. See changes as they happen and brainstorm together.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Sharing</h3>
                <p className="text-slate-600 leading-relaxed">
                  Export to PNG, SVG, or share with a link. Integrate seamlessly into your workflow.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-amber-600 rounded-lg flex items-center justify-center mb-6">
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Infinite Canvas</h3>
                <p className="text-slate-600 leading-relaxed">
                  Never run out of space. Pan and zoom freely on an unlimited canvas for your ideas.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-rose-600 rounded-lg flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your data is encrypted and secure. Choose to work offline or sync with the cloud.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center mb-6">
                  <Pencil className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Hand-drawn Style</h3>
                <p className="text-slate-600 leading-relaxed">
                  Beautiful hand-drawn aesthetics that make your diagrams stand out from the rest.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Creating?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of teams using DrawFlow to bring their ideas to life.
              No credit card required.
            </p>
            <button className="bg-white text-blue-600 px-10 py-4 rounded-lg hover:bg-blue-50 transition-all hover:shadow-2xl font-bold text-lg">
              Get Started for Free
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Pencil className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">DrawFlow</span>
            </div>
            <p className="text-sm">© 2025 DrawFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
