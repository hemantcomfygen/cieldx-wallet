import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function CryptoQRCode({
  address,
  size = 300,
  errorCorrectionLevel = 'H',
  margin = 2,
  darkColor = '#000000',
  lightColor = '#FFFFFF'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (address && canvasRef.current) {
      // Clear previous QR code
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Generate new QR code
      QRCode.toCanvas(canvasRef.current, address, {
        errorCorrectionLevel,
        width: size,
        margin,
        color: {
          dark: darkColor,
          light: lightColor
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
        }
      });
    }
  }, [address, size, errorCorrectionLevel, margin, darkColor, lightColor]);

  if (!address) {
    return <p className='text-black'>No address provided</p>;
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
