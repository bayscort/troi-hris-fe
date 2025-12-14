import React from 'react';
import { Mail, Phone } from 'lucide-react';

const ContactSupportPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h1>
      <p className="text-gray-700 text-base mb-6">
        If you're experiencing issues or need assistance, please contact the <strong>IT Support Team</strong>. We're here to help!
      </p>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-orange-500" />
          <a href="mailto:bayunovaridho@gmail.com" className="text-sm text-gray-800 hover:underline">
            bayunovaridho@gmail.com
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <Phone className="w-5 h-5 text-orange-500" />
          <p className="text-sm text-gray-800">+62 857-1132-7242</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-gray-500">
          IT support is available from <strong>Monday to Sunday, 9 AM – 5 PM</strong>.
        </p>
      </div>
    </div>
  );
};

export default ContactSupportPage;
