import Image from 'next/image';

interface LogoProps {
  height?: number;
  inverted?: boolean;
}

export default function Logo({ height = 120, inverted = false }: LogoProps) {
  return (
    <div className="flex items-center gap-0">
      <Image
        src="/WhatsApp_Image_2026-04-20_at_14.03.28-removebg-preview.png"
        alt="Adalya Solar"
        height={height}
        width={height}
        style={{ objectFit: 'contain', marginRight: -18 }}
        priority
      />
      <div className="flex flex-col leading-none">
        <span
          style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: '0.05em',
            color: inverted ? '#ffffff' : '#1B3A6B',
          }}
        >
          ADALYA SOLAR
        </span>
        <span
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            fontSize: 9.5,
            letterSpacing: '0.2em',
            color: '#F97316',
            marginTop: 5,
          }}
        >
          — ENERJİ —
        </span>
      </div>
    </div>
  );
}
