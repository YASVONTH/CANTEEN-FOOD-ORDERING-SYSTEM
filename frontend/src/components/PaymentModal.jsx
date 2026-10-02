import { useState, useEffect } from 'react';
import GooglePayButton from '@google-pay/button-react';

const PaymentModal = ({ isOpen, onClose, cartTotal, onPaymentSuccess, orderItems }) => {
    const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi', 'gpay', 'card', 'cash'
    const [upiId, setUpiId] = useState('');
    const [upiApp, setUpiApp] = useState('gpay'); // 'gpay', 'phonepe', 'paytm'
    
    // Card State
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    // Flow State: 'select' | 'processing' | 'otp' | 'success'
    const [paymentState, setPaymentState] = useState('select');
    const [otp, setOtp] = useState('');
    const [generatedToken, setGeneratedToken] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 mins for UPI QR
    const [copiedUpi, setCopiedUpi] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setPaymentState('select');
            setOtp('');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleCopyUpi = () => {
        navigator.clipboard?.writeText('canteenhub@okaxis');
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
    };

    // Format card number with spaces
    const handleCardNumberChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardDetails({ ...cardDetails, number: formatted });
    };

    // Format Expiry MM/YY
    const handleExpiryChange = (e) => {
        let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (raw.length >= 3) {
            raw = `${raw.substring(0, 2)}/${raw.substring(2)}`;
        }
        setCardDetails({ ...cardDetails, expiry: raw });
    };

    const handleCardSubmit = (e) => {
        e.preventDefault();
        if (cardDetails.number.replace(/\s/g, '').length < 16) {
            alert('Please enter a valid 16-digit card number');
            return;
        }
        if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
            alert('Please enter a valid expiry date (MM/YY)');
            return;
        }
        if (cardDetails.cvv.length < 3) {
            alert('Please enter a 3-digit CVV');
            return;
        }

        // Move to OTP step
        setPaymentState('otp');
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        processFinalPayment('Credit/Debit Card', `CARD_${Date.now().toString(36).toUpperCase()}`);
    };

    const handleUpiPay = () => {
        processFinalPayment(`UPI (${upiApp.toUpperCase()})`, `UPI_${Date.now().toString(36).toUpperCase()}`);
    };

    const handleCashPay = () => {
        processFinalPayment('Pay at Counter (Cash/UPI)', `CASH_${Date.now().toString(36).toUpperCase()}`, 'Pending at Counter');
    };

    const processFinalPayment = (methodName, txnId, status = 'Paid') => {
        setPaymentState('processing');
        setTransactionId(txnId);

        setTimeout(() => {
            const resultOrder = onPaymentSuccess({
                paymentMethod: methodName,
                paymentId: txnId,
                paymentStatus: status
            });
            setGeneratedToken(resultOrder?.tokenNumber || 101);
            setPaymentState('success');
        }, 1500);
    };

    // Construct standard UPI URI for QR Code generator
    const upiUri = `upi://pay?pa=canteenhub@okaxis&pn=CanteenHub&am=${cartTotal}&cu=INR&tn=CanteenOrder`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 9999 }}>
            <div className="modal-content payment-modal" style={{ maxWidth: '580px', borderRadius: '1.25rem', overflow: 'hidden', padding: 0 }}>
                {/* Modal Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #fc8019 0%, #e23744 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.4rem', margin: 0 }}>Secure Checkout</h2>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                            {paymentState === 'success' ? 'Payment Confirmed' : `Amount Payable: ₹${cartTotal.toFixed(2)}`}
                        </span>
                    </div>
                    {paymentState !== 'processing' && (
                        <button
                            onClick={onClose}
                            style={{
                                color: 'white',
                                fontSize: '1.8rem',
                                background: 'rgba(255,255,255,0.2)',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            &times;
                        </button>
                    )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* 1. SELECT PAYMENT METHOD */}
                    {paymentState === 'select' && (
                        <div>
                            {/* Payment Navigation Tabs */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMethod('upi')}
                                    className={`pay-tab-btn ${selectedMethod === 'upi' ? 'active' : ''}`}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '0.75rem',
                                        border: selectedMethod === 'upi' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: selectedMethod === 'upi' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem' }}>📱</span>
                                    UPI / QR
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedMethod('gpay')}
                                    className={`pay-tab-btn ${selectedMethod === 'gpay' ? 'active' : ''}`}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '0.75rem',
                                        border: selectedMethod === 'gpay' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: selectedMethod === 'gpay' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem' }}>⚡</span>
                                    Google Pay
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedMethod('card')}
                                    className={`pay-tab-btn ${selectedMethod === 'card' ? 'active' : ''}`}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '0.75rem',
                                        border: selectedMethod === 'card' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: selectedMethod === 'card' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem' }}>💳</span>
                                    Card
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedMethod('cash')}
                                    className={`pay-tab-btn ${selectedMethod === 'cash' ? 'active' : ''}`}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '0.75rem',
                                        border: selectedMethod === 'cash' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: selectedMethod === 'cash' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '1.3rem' }}>💵</span>
                                    Counter
                                </button>
                            </div>

                            {/* TAB 1: UPI & QR CODE */}
                            {selectedMethod === 'upi' && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        background: '#fafafa',
                                        border: '1px dashed var(--color-primary)',
                                        borderRadius: '1rem',
                                        padding: '1.25rem',
                                        marginBottom: '1rem',
                                        display: 'inline-block'
                                    }}>
                                        <img
                                            src={qrUrl}
                                            alt="UPI QR Code"
                                            style={{ width: '160px', height: '160px', display: 'block', margin: '0 auto', borderRadius: '0.5rem' }}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                            Scan with any UPI App (GPay, PhonePe, Paytm)
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        fontSize: '0.85rem'
                                    }}>
                                        <span>UPI ID: <strong>canteenhub@okaxis</strong></span>
                                        <button
                                            type="button"
                                            onClick={handleCopyUpi}
                                            style={{
                                                padding: '0.2rem 0.6rem',
                                                background: '#eee',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {copiedUpi ? '✓ Copied' : 'Copy'}
                                        </button>
                                        <span style={{ color: '#e23744', fontWeight: 600, marginLeft: '0.5rem' }}>
                                            ⏱ {formatTime(countdown)}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                        {['gpay', 'phonepe', 'paytm'].map((app) => (
                                            <button
                                                key={app}
                                                type="button"
                                                onClick={() => setUpiApp(app)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '0.5rem',
                                                    border: upiApp === app ? '2px solid var(--color-primary)' : '1px solid #ddd',
                                                    background: upiApp === app ? '#fff3ea' : '#fff',
                                                    textTransform: 'capitalize',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm'}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleUpiPay}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
                                    >
                                        I Have Paid ₹{cartTotal.toFixed(2)} via UPI ➔
                                    </button>
                                </div>
                            )}

                            {/* TAB 2: GOOGLE PAY */}
                            {selectedMethod === 'gpay' && (
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                        Fast, 1-click checkout with Google Pay. Instant verified receipt.
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <GooglePayButton
                                            environment="TEST"
                                            paymentRequest={{
                                                apiVersion: 2,
                                                apiVersionMinor: 0,
                                                allowedPaymentMethods: [
                                                    {
                                                        type: 'CARD',
                                                        parameters: {
                                                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                                        },
                                                        tokenizationSpecification: {
                                                            type: 'PAYMENT_GATEWAY',
                                                            parameters: {
                                                                gateway: 'example',
                                                                gatewayMerchantId: 'exampleGatewayMerchantId',
                                                            },
                                                        },
                                                    },
                                                ],
                                                merchantInfo: {
                                                    merchantId: '12345678901234567890',
                                                    merchantName: 'Canteen Food Ordering Hub',
                                                },
                                                transactionInfo: {
                                                    totalPriceStatus: 'FINAL',
                                                    totalPriceLabel: 'Total',
                                                    totalPrice: cartTotal.toFixed(2),
                                                    currencyCode: 'INR',
                                                    countryCode: 'IN',
                                                },
                                            }}
                                            onLoadPaymentData={(paymentRequest) => {
                                                processFinalPayment('Google Pay', `GPAY_${Date.now().toString(36).toUpperCase()}`);
                                            }}
                                            buttonSizeMode="fill"
                                            buttonType="pay"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => processFinalPayment('Google Pay Express', `GPAY_${Date.now().toString(36).toUpperCase()}`)}
                                        className="btn btn-outline"
                                        style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}
                                    >
                                        Direct GPay Instant Checkout
                                    </button>
                                </div>
                            )}

                            {/* TAB 3: CREDIT / DEBIT CARD */}
                            {selectedMethod === 'card' && (
                                <form onSubmit={handleCardSubmit}>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label className="form-label">Cardholder Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Name as on card"
                                            value={cardDetails.name}
                                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label className="form-label">Card Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="xxxx xxxx xxxx xxxx"
                                                value={cardDetails.number}
                                                onChange={handleCardNumberChange}
                                                maxLength={19}
                                                required
                                            />
                                            <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '1.2rem' }}>💳</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Valid Thru (MM/YY)</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiry}
                                                onChange={handleExpiryChange}
                                                maxLength={5}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">CVV / CVC</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                placeholder="•••"
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) })}
                                                maxLength={3}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
                                    >
                                        Pay ₹{cartTotal.toFixed(2)} via Card 🔒
                                    </button>
                                </form>
                            )}

                            {/* TAB 4: PAY AT COUNTER */}
                            {selectedMethod === 'cash' && (
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>Pay at Canteen Counter</h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                        Your order token will be generated immediately. Show your Token Number at the billing counter to pay by Cash or Card and collect your food.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleCashPay}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
                                    >
                                        Confirm & Generate Token (₹{cartTotal.toFixed(2)}) ➔
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. CARD OTP VERIFICATION SCREEN */}
                    {paymentState === 'otp' && (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Bank OTP Verification</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                Enter the 6-digit OTP sent to your registered mobile number for ₹{cartTotal.toFixed(2)}.
                            </p>
                            <form onSubmit={handleVerifyOtp}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter OTP (e.g. 123456)"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                    style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', marginBottom: '1rem' }}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                                >
                                    Authorize Payment
                                </button>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentState('select')}
                                        style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}
                                    >
                                        ← Change Payment Method
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* 3. PROCESSING LOADER */}
                    {paymentState === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <div className="spinner" style={{
                                width: '50px',
                                height: '50px',
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid var(--color-primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 1.5rem auto'
                            }}></div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Processing Payment...</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                Communicating securely with the bank gateway. Please do not refresh.
                            </p>
                        </div>
                    )}

                    {/* 4. SUCCESS SCREEN WITH RECEIPT & TOKEN */}
                    {paymentState === 'success' && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2.5rem',
                                margin: '0 auto 1rem auto',
                                boxShadow: '0 8px 20px rgba(40, 167, 69, 0.3)'
                            }}>
                                ✓
                            </div>

                            <h2 style={{ color: 'var(--color-success)', marginBottom: '0.25rem' }}>Order Placed Successfully!</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Transaction ID: <strong style={{ color: 'var(--color-text)' }}>{transactionId}</strong>
                            </p>

                            {/* Big Token Display */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1c1c1c 0%, #333 100%)',
                                color: 'white',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                marginBottom: '1.5rem',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div style={{ fontSize: '0.85rem', letterSpacing: '2px', color: 'var(--color-primary)', fontWeight: 700 }}>
                                    YOUR FOOD PICKUP TOKEN
                                </div>
                                <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0.25rem 0', color: '#ffc107' }}>
                                    #{generatedToken}
                                </div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                                    Estimated prep time: 10-15 mins • Live updates on Track Orders
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => window.print()}
                                    style={{ flex: 1, padding: '0.85rem' }}
                                >
                                    🖨️ Print Receipt
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onClose}
                                    style={{ flex: 1.5, padding: '0.85rem', fontWeight: 700 }}
                                >
                                    Track Live Status ➔
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
