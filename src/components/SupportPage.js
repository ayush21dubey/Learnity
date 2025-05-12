import React from 'react';
import { Heart } from 'lucide-react';

function SupportPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="bg-[#0077b6] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Support Learnity</h1>
          <p className="text-xl text-[#caf0f8] max-w-2xl mx-auto">
            Your support helps us create better educational content
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          {/* Thank You Message */}
          <div className="mb-8">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Heart className="h-8 w-8 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Thank You for Supporting Us!
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your contribution helps us maintain and improve the platform, 
              create more educational content, and reach more learners worldwide.
            </p>
          </div>

          {/* UPI QR Code Section */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Scan QR Code to Support
            </h3>
            <div className="mb-4">
              <img 
                src="/upi-qr-code.png" // Replace with your actual QR code image
                alt="UPI QR Code"
                className="mx-auto w-48 h-48 object-contain"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">UPI ID: ayush21dubey@oksbi</p>
              <p>Scan with any UPI app to contribute</p>
            </div>
          </div>

          {/* Additional Message */}
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Every contribution, no matter how small, makes a difference.
            </p>
            <p className="text-sm">
              For any questions or support, contact us at{' '}
              <a 
                href="mailto:ayush2dubey4u@gmail.com" 
                className="text-[#0077b6] hover:text-[#005f8b]"
              >
                ayush2dubey4u@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SupportPage; 