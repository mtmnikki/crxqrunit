import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Public footer for marketing site
 */
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl text-gray-900">ClinicalRxQ</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Transforming community pharmacy through comprehensive clinical training and turnkey infrastructure.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Programs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-600">TimeMyMeds</span>
              </li>
              <li>
                <span className="text-gray-600">MTM Training</span>
              </li>
              <li>
                <span className="text-gray-600">Test & Treat</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Member Login
                </Link>
              </li>
              <li>
                <span className="text-gray-600">Help Center</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 ClinicalRxQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}