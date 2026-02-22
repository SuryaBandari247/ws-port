import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
  itemDescription: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  itemDescription,
}) => {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // PayPal Client ID - This is safe to put in code (it's a public key)
  // Replace with your actual Client ID from PayPal
  const PAYPAL_CLIENT_ID = 'AVOQ7jzJkMtSk0ttbX7Uhk9QZI5y4K_U66cdB2jwn_5eCs0O9LpQF-N5TxqB8lwQw-6hXLGPw_rzTAQn'; // ← Paste your Client ID here

  // Debug: Log Client ID for verification (remove after testing)
  console.log('🔑 PayPal Client ID:', PAYPAL_CLIENT_ID);
  console.log('✅ Payment Modal Opened - Amount:', `€${amount.toFixed(2)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Complete Your Purchase</h2>
          <p className="text-indigo-100 text-sm">Secure payment powered by PayPal</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Item Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">Passport Photo Download</h3>
                <p className="text-sm text-gray-600 mt-1">{itemDescription}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">€{amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">What you get:</h4>
            <div className="space-y-2">
              {[
                'High-resolution download (300 DPI)',
                'Both PNG and JPG formats',
                'Professional quality output',
                'Instant download access',
                'No watermarks',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <Lock className="h-4 w-4 text-green-600" />
            <span>Secure payment processing. Your data is encrypted and protected.</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* PayPal Buttons */}
          <div className="space-y-3">
            <PayPalScriptProvider
              options={{
                clientId: PAYPAL_CLIENT_ID,
                currency: 'EUR',
                intent: 'capture',
              }}
            >
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'paypal',
                }}
                createOrder={(_data, actions) => {
                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [
                      {
                        description: itemDescription,
                        amount: {
                          currency_code: 'EUR',
                          value: amount.toFixed(2),
                        },
                      },
                    ],
                  });
                }}
                onApprove={async (_data, actions) => {
                  setIsProcessing(true);
                  try {
                    if (!actions.order) {
                      throw new Error('Order actions not available');
                    }
                    const details = await actions.order.capture();
                    console.log('Payment successful:', details);
                    
                    // Mark payment as successful in session storage
                    sessionStorage.setItem('easyportrait_payment_status', 'paid');
                    sessionStorage.setItem('easyportrait_payment_timestamp', Date.now().toString());
                    sessionStorage.setItem('easyportrait_payment_id', details.id || '');
                    
                    onPaymentSuccess();
                  } catch (err) {
                    console.error('Payment capture error:', err);
                    setError('Payment processing failed. Please try again.');
                    setIsProcessing(false);
                  }
                }}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setError('Payment failed. Please try again.');
                  setIsProcessing(false);
                }}
                onCancel={() => {
                  setError('Payment was cancelled.');
                  setIsProcessing(false);
                }}
              />
            </PayPalScriptProvider>
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
