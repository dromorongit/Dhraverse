import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900">Dhraverse</h3>
            <p className="mt-2 text-sm text-gray-600">
              Powering Digital Trade - The Smart Commerce Ecosystem
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/marketplace" className="text-base text-gray-500 hover:text-gray-900">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Support
            </h4>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-base text-gray-500 hover:text-gray-900">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-base text-gray-400">
              &copy; 2026 Dhraverse. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-gray-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-gray-600">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}