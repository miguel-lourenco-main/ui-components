import Link from 'next/link'
import { PlayIcon, CodeIcon, LayoutIcon } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            UI Components Playground
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive playground for testing and documenting UI components. 
            Fetch components from GitLab repositories and test them with real-time editing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <CodeIcon className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Live Code Editing</h3>
            <p className="text-gray-600">
              Monaco editor with TypeScript support for real-time component editing and preview.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <LayoutIcon className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interactive Props</h3>
            <p className="text-gray-600">
              Dynamic props panel with auto-generated controls for testing component behavior.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <PlayIcon className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">GitLab Integration</h3>
            <p className="text-gray-600">
              Seamlessly fetch and test components from your GitLab repositories.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/playground"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Open Playground
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-8">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CodeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-medium">Component Search</h4>
              <p className="text-sm text-gray-600">Find and filter components easily</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <LayoutIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-medium">Responsive Testing</h4>
              <p className="text-sm text-gray-600">Test on desktop, tablet, and mobile</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PlayIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-medium">Error Boundaries</h4>
              <p className="text-sm text-gray-600">Safe component rendering with fallbacks</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CodeIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-medium">TypeScript Support</h4>
              <p className="text-sm text-gray-600">Full TypeScript intellisense and validation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 