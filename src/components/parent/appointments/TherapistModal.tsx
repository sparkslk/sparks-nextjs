"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, User, Calendar } from "lucide-react";
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
      `}</style>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 styled-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              {/* <h2 className="text-xl font-bold text-gray-900">Therapist Profile</h2> */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8159A8' }}>
                  <span className="font-bold text-white text-2xl">
                    {therapist.name ? 
                      therapist.name.split(' ').map((name: string) => name[0]).join('').toUpperCase() :
                      'T'
                    }
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Therapist Information */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {therapist.name || 'Therapist'}
                </h3>
    
                <p className="text-sm" style={{ color: '#8159A8' }}>{therapist.specialization}</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(therapist.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.958c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.54-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.055 9.385c-.783-.57-.38-1.81.588-1.81h4.161a1 1 0 00.95-.69l1.286-3.958z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">Experience: {therapist.experience} years</p>
              </div>

              {/* Bio */}
              {therapist.bio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">About</h4>
                  <p className="text-sm text-gray-600">{therapist.bio}</p>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {/* <h4 className="font-medium text-gray-900 mb-2">Therapist Details</h4> */}
                
                {/* {therapist.userId && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">User ID:</span>
                    <span className="text-sm text-gray-600">{therapist.userId}</span>
                  </div>
                )} */}
                
                {therapist.organizationId && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Organization ID:</span>
                    <span className="text-sm text-gray-600">{therapist.organizationId}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">License Number:</span>
                  <span className="text-sm text-gray-600">{therapist.licenseNumber}</span>
                </div>
                
                {therapist.availability && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Availability:</span>
                    <span className="text-sm text-gray-600">
                      {Object.keys(therapist.availability).length > 0 ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  {/* <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
                      <svg className="w-4 h-4" style={{ color: '#8159A8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{therapist.phone || 'Not provided'}</p>
                    </div>
                  </div> */}

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
                      <svg className="w-4 h-4" style={{ color: '#8159A8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{therapist.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F3FB' }}>
                      <User className="w-4 h-4" style={{ color: '#8159A8' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Professional Focus</p>
                      <p className="text-sm text-gray-600">{therapist.specialization}</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  className="flex-1 text-white hover:opacity-90 transition-all duration-300"
                  style={{ backgroundColor: '#8159A8' }}
                  onClick={() => {
                    alert('Booking session with ' + therapist.name);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}