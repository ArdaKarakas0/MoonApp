
import React, { useState, useMemo } from 'react';
import { SubscriptionPlan } from '../types';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { XIcon } from './icons/XIcon';

// Luhn algorithm check for credit card number validity
const isValidLuhn = (value: string): boolean => {
    let nCheck = 0;
    let bEven = false;
    const sCardNum = value.replace(/\D/g, "");
    if (!sCardNum) return false;

    for (let n = sCardNum.length - 1; n >= 0; n--) {
        const cDigit = sCardNum.charAt(n);
        let nDigit = parseInt(cDigit, 10);
        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }
        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) === 0;
};

const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{1,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
        return parts.join(' ');
    }
    return value;
};

const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\s*\/\s*/g, '').replace(/[^0-9]/gi, '');
    if (cleanValue.length >= 3) {
        return `${cleanValue.slice(0, 2)} / ${cleanValue.slice(2, 4)}`;
    }
    return cleanValue;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isFormComplete = useMemo(() => {
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    return (
        rawCardNumber.length >= 13 &&
        rawCardNumber.length <= 19 &&
        expiry.length === 7 &&
        cvc.length >= 3 &&
        cvc.length <= 4
    );
  }, [cardNumber, expiry, cvc]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const rawCardNumber = cardNumber.replace(/\s/g, '');

    // Card Number Validation
    if (!isValidLuhn(rawCardNumber)) {
        newErrors.cardNumber = "Please enter a valid card number.";
    }

    // Expiry Date Validation
    const [monthStr, yearStr] = expiry.split(' / ');
    if (!monthStr || !yearStr || monthStr.length !== 2 || yearStr.length !== 2) {
        newErrors.expiry = "Expiry must be in MM / YY format.";
    } else {
        const month = parseInt(monthStr, 10);
        const year = parseInt(`20${yearStr}`, 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12

        if (month < 1 || month > 12) {
            newErrors.expiry = "Invalid month.";
        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
            newErrors.expiry = "This card has expired.";
        }
    }
    
    // CVC Validation
    if (cvc.length < 3 || cvc.length > 4) {
        newErrors.cvc = "CVC must be 3 or 4 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string, formatter?: (val: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = formatter ? formatter(e.target.value) : e.target.value;
      setter(value);
      if (errors[field]) {
          setErrors(prev => {
              const newErrors = {...prev};
              delete newErrors[field];
              return newErrors;
          });
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsProcessing(true);
      // Simulate network request
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-br from-celestial-blue to-midnight-purple rounded-2xl p-8 shadow-glow-white border border-starlight-silver/20 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-starlight-silver/70 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-white">Unlock {plan.name}</h2>
            <p className="text-moonbeam-gold text-4xl font-bold my-4">{plan.price}</p>
            <p className="text-starlight-silver/80">You are about to begin a deeper journey. Please confirm your secure payment.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-starlight-silver/90 mb-2">Card Number</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <CreditCardIcon className="h-5 w-5 text-starlight-silver/50" />
                    </div>
                    <input 
                        type="tel" 
                        id="cardNumber" 
                        placeholder="**** **** **** ****" 
                        value={cardNumber}
                        onChange={handleInputChange(setCardNumber, 'cardNumber', formatCardNumber)}
                        maxLength={19}
                        className={`w-full bg-celestial-blue/50 border rounded-lg pl-10 pr-4 py-2 text-white placeholder-starlight-silver/50 focus:ring-2 focus:outline-none transition-shadow ${errors.cardNumber ? 'border-red-500/70 focus:ring-red-500/50' : 'border-starlight-silver/20 focus:ring-moonbeam-gold focus:border-moonbeam-gold'}`}
                        aria-invalid={!!errors.cardNumber}
                        aria-describedby={errors.cardNumber ? "card-error" : undefined}
                    />
                </div>
                {errors.cardNumber && <p id="card-error" className="mt-1 text-xs text-red-400">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-starlight-silver/90 mb-2">Expiry</label>
                    <input 
                        type="tel" 
                        id="expiry" 
                        placeholder="MM / YY" 
                        value={expiry}
                        onChange={handleInputChange(setExpiry, 'expiry', formatExpiryDate)}
                        maxLength={7}
                        className={`w-full bg-celestial-blue/50 border rounded-lg px-4 py-2 text-white placeholder-starlight-silver/50 focus:ring-2 focus:outline-none transition-shadow ${errors.expiry ? 'border-red-500/70 focus:ring-red-500/50' : 'border-starlight-silver/20 focus:ring-moonbeam-gold focus:border-moonbeam-gold'}`}
                        aria-invalid={!!errors.expiry}
                        aria-describedby={errors.expiry ? "expiry-error" : undefined}
                    />
                    {errors.expiry && <p id="expiry-error" className="mt-1 text-xs text-red-400">{errors.expiry}</p>}
                </div>
                <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-starlight-silver/90 mb-2">CVC</label>
                    <input 
                        type="tel" 
                        id="cvc" 
                        placeholder="123" 
                        value={cvc}
                        onChange={handleInputChange(setCvc, 'cvc', (v) => v.replace(/[^0-9]/gi, ''))}
                        maxLength={4}
                        className={`w-full bg-celestial-blue/50 border rounded-lg px-4 py-2 text-white placeholder-starlight-silver/50 focus:ring-2 focus:outline-none transition-shadow ${errors.cvc ? 'border-red-500/70 focus:ring-red-500/50' : 'border-starlight-silver/20 focus:ring-moonbeam-gold focus:border-moonbeam-gold'}`}
                        aria-invalid={!!errors.cvc}
                        aria-describedby={errors.cvc ? "cvc-error" : undefined}
                    />
                    {errors.cvc && <p id="cvc-error" className="mt-1 text-xs text-red-400">{errors.cvc}</p>}
                </div>
            </div>

            <div className="pt-4">
                 <button
                    type="submit"
                    disabled={isProcessing || !isFormComplete}
                    className="w-full bg-moonbeam-gold text-celestial-blue font-bold py-3 px-4 rounded-lg hover:bg-amber-300 transition-colors duration-300 shadow-lg shadow-moonbeam-gold/20 disabled:bg-starlight-silver/20 disabled:text-starlight-silver/50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                >
                    {isProcessing ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-celestial-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Processing...
                        </>
                    ) : (
                       `Confirm and Pay ${plan.price}`
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
