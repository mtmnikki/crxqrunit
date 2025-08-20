import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

/**
 * Public header for marketing site
 * Responsive navigation with mobile menu
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ClinicalRxQ</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          <Link 
            to="/about" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4 ml-auto">
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-brand-gradient hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            <Link
              to="/about"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="px-3 py-2 space-y-2">
              <Link to="/login" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="block">
                <Button size="sm" className="w-full bg-brand-gradient">
                  Sign Up
                </Button>
              </Link>
              <Link to="/login" className="block">
                <Button size="sm" className="w-full" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}