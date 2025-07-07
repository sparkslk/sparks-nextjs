"use client";

import { Button } from "@/components/ui/button";
import { User, Calendar, Star, Mail, Award } from "lucide-react";
import { Child } from "@/types/appointments";

interface TherapistModalProps {
  therapist: Child['therapist'];
  isOpen: boolean;
  onClose: () => void;
}

export default function TherapistModal({ therapist, isOpen, onClose }: TherapistModalProps) {
  if (!isOpen || !therapist) return null;

  return (
    <>
      <style jsx>{`
        .styled-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .styled-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .online-indicator {
          animation: pulse 2s infinite;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(129, 89, 168, 0.15);
        }

        .gradient-text {
          background: linear-gradient(135deg, #8159A8, #6B46C1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .icon-bounce:hover {
          animation: bounce 0.6s;
        }

        @keyframes bounce {
          0%, 20%, 60%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          80% { transform: translateY(-5px); }
        }
      `}</style>
      
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/50 to-purple-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
        
        {/* Modal Container */}
        <div className="glass-card rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 animate-slideUp">
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 styled-scrollbar">
            
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 rounded-full p-3 icon-bounce group"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Section */}
            <div className="text-center mb-8">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl ring-4 ring-purple-100" style={{ background: 'linear-gradient(135deg, #8159A8, #8159A8, #8159A8)' }}>
                  <span className="font-bold text-white text-3xl tracking-wider">
                    {therapist.name ? 
                      therapist.name.split(' ').map((name: string) => name[0]).join('').toUpperCase() :
                      'T'
                    }
                  </span>
                </div>
              </div>

              {/* Name & Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {therapist.name || 'Therapist'}
              </h3>
              
              <p className="text-lg font-medium gradient-text mb-3">
                {therapist.specialization}
              </p>

              {/* Rating */}
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(therapist.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {therapist.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>

              {/* Experience */}
              <div className="inline-flex items-center bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                {therapist.experience} years experience
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              
              {/* Bio Section */}
              {therapist.bio && (
                <div className="card-hover p-6 rounded-2xl shadow-sm" style={{ backgroundColor: '#f8f5fc' }}>
                  <h4 className="font-bold mb-3 flex items-center text-lg" style={{ color: '#8159A8' }}>
                    <User className="w-5 h-5 mr-2" />
                    About Me
                  </h4>
                  <p className="leading-relaxed" style={{ color: '#6b4c93' }}>{therapist.bio}</p>
                </div>
              )}

              {/* Professional Details */}
              <div className="card-hover bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Professional Details
                </h4>
                
                <div className="space-y-4">
                  {therapist.organizationId && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Organization ID:</span>
                      <span className="text-gray-600 bg-white px-3 py-1 rounded-lg text-sm">{therapist.organizationId}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">License Number:</span>
                    <span className="text-gray-600 bg-white px-3 py-1 rounded-lg text-sm">{therapist.licenseNumber}</span>
                  </div>
                  
                  {therapist.availability && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Availability:</span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${Object.keys(therapist.availability).length > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {Object.keys(therapist.availability).length > 0 ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Email</p>
                      <p className="text-blue-700 text-sm break-all">{therapist.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Specialization</p>
                      <p className="text-blue-700 text-sm">{therapist.specialization}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50/50">
            <Button
              className="w-full text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#8159A8' }}
              onClick={() => {
                alert('Booking session with ' + therapist.name);
              }}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Book Session
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}