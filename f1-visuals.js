/**
 * ULTIMATE F1 HUB — BESPOKE ANIMATED MOTORSPORT VISUAL ASSETS
 * Provides unique, high-fidelity, non-photorealistic stylized vector illustrations
 * for all 22 Formula 1 drivers and 11 Formula 1 constructors.
 * Features distinct helmet liveries, aerodynamic chassis, driver numbers, and subtle animations.
 */

const F1_VISUALS = (function () {

  const DRIVER_PROFILES = {
    verstappen: {
      name: "Max Verstappen", number: 1, code: "VER", flag: "🇳🇱",
      teamColor: "#1E41B0", helmetMain: "#0F1A34", helmetAccent: "#E5A919",
      visorColor: "#E10600", suitColor: "#0B1528", pattern: "lion"
    },
    norris: {
      name: "Lando Norris", number: 4, code: "NOR", flag: "🇬🇧",
      teamColor: "#FF8000", helmetMain: "#CCFF00", helmetAccent: "#1A1A1A",
      visorColor: "#00E5FF", suitColor: "#1F2024", pattern: "quad"
    },
    leclerc: {
      name: "Charles Leclerc", number: 16, code: "LEC", flag: "🇲🇨",
      teamColor: "#E80020", helmetMain: "#E80020", helmetAccent: "#FFFFFF",
      visorColor: "#FFD700", suitColor: "#A60017", pattern: "monaco"
    },
    hamilton: {
      name: "Sir Lewis Hamilton", number: 44, code: "HAM", flag: "🇬🇧",
      teamColor: "#E80020", helmetMain: "#E0E722", helmetAccent: "#7928CA",
      visorColor: "#9333EA", suitColor: "#18181B", pattern: "wings"
    },
    piastri: {
      name: "Oscar Piastri", number: 81, code: "PIA", flag: "🇦🇺",
      teamColor: "#FF8000", helmetMain: "#1E3A8A", helmetAccent: "#FF8000",
      visorColor: "#10B981", suitColor: "#1F2024", pattern: "aussie"
    },
    russell: {
      name: "George Russell", number: 63, code: "RUS", flag: "🇬🇧",
      teamColor: "#00D2BE", helmetMain: "#38BDF8", helmetAccent: "#0F172A",
      visorColor: "#0284C7", suitColor: "#1E293B", pattern: "precision"
    },
    antonelli: {
      name: "Andrea Kimi Antonelli", number: 12, code: "ANT", flag: "🇮🇹",
      teamColor: "#00D2BE", helmetMain: "#10B981", helmetAccent: "#EF4444",
      visorColor: "#F59E0B", suitColor: "#0F172A", pattern: "tricolore"
    },
    sainz: {
      name: "Carlos Sainz Jr.", number: 55, code: "SAI", flag: "🇪🇸",
      teamColor: "#005AFF", helmetMain: "#B91C1C", helmetAccent: "#FBBF24",
      visorColor: "#DC2626", suitColor: "#082F49", pattern: "chili"
    },
    albon: {
      name: "Alexander Albon", number: 23, code: "ALB", flag: "🇹🇭",
      teamColor: "#005AFF", helmetMain: "#0284C7", helmetAccent: "#DC2626",
      visorColor: "#38BDF8", suitColor: "#0C4A6E", pattern: "thai"
    },
    alonso: {
      name: "Fernando Alonso", number: 14, code: "ALO", flag: "🇪🇸",
      teamColor: "#006F62", helmetMain: "#0284C7", helmetAccent: "#EAB308",
      visorColor: "#EF4444", suitColor: "#064E3B", pattern: "asturias"
    },
    stroll: {
      name: "Lance Stroll", number: 18, code: "STR", flag: "🇨🇦",
      teamColor: "#006F62", helmetMain: "#047857", helmetAccent: "#DC2626",
      visorColor: "#10B981", suitColor: "#064E3B", pattern: "maple"
    },
    gasly: {
      name: "Pierre Gasly", number: 10, code: "GAS", flag: "🇫🇷",
      teamColor: "#0090FF", helmetMain: "#1D4ED8", helmetAccent: "#E11D48",
      visorColor: "#EC4899", suitColor: "#1E1B4B", pattern: "tricolore"
    },
    doohan: {
      name: "Jack Doohan", number: 7, code: "DOO", flag: "🇦🇺",
      teamColor: "#0090FF", helmetMain: "#0284C7", helmetAccent: "#F59E0B",
      visorColor: "#38BDF8", suitColor: "#172554", pattern: "ocean"
    },
    tsunoda: {
      name: "Yuki Tsunoda", number: 22, code: "TSU", flag: "🇯🇵",
      teamColor: "#1634CB", helmetMain: "#DC2626", helmetAccent: "#FFFFFF",
      visorColor: "#F97316", suitColor: "#1E3A8A", pattern: "sun"
    },
    hadjar: {
      name: "Isack Hadjar", number: 6, code: "HAD", flag: "🇫🇷",
      teamColor: "#1634CB", helmetMain: "#2563EB", helmetAccent: "#DC2626",
      visorColor: "#60A5FA", suitColor: "#172554", pattern: "flame"
    },
    lawson: {
      name: "Liam Lawson", number: 30, code: "LAW", flag: "🇳🇿",
      teamColor: "#1E41B0", helmetMain: "#09090B", helmetAccent: "#06B6D4",
      visorColor: "#3B82F6", suitColor: "#0F172A", pattern: "fern"
    },
    hulkenberg: {
      name: "Nico Hülkenberg", number: 27, code: "HUL", flag: "🇩🇪",
      teamColor: "#52E252", helmetMain: "#18181B", helmetAccent: "#84CC16",
      visorColor: "#22C55E", suitColor: "#27272A", pattern: "hulk"
    },
    bortoleto: {
      name: "Gabriel Bortoleto", number: 5, code: "BOR", flag: "🇧🇷",
      teamColor: "#52E252", helmetMain: "#EAB308", helmetAccent: "#16A34A",
      visorColor: "#2563EB", suitColor: "#14532D", pattern: "brazil"
    },
    ocon: {
      name: "Esteban Ocon", number: 31, code: "OCO", flag: "🇫🇷",
      teamColor: "#E10600", helmetMain: "#B91C1C", helmetAccent: "#38BDF8",
      visorColor: "#E10600", suitColor: "#18181B", pattern: "force"
    },
    bearman: {
      name: "Oliver Bearman", number: 87, code: "BEA", flag: "🇬🇧",
      teamColor: "#E10600", helmetMain: "#1E293B", helmetAccent: "#EF4444",
      visorColor: "#F59E0B", suitColor: "#0F172A", pattern: "union"
    },
    herta: {
      name: "Colton Herta", number: 26, code: "HER", flag: "🇺🇸",
      teamColor: "#D4AF37", helmetMain: "#1E3A8A", helmetAccent: "#D4AF37",
      visorColor: "#F59E0B", suitColor: "#0F172A", pattern: "stars"
    },
    maloney: {
      name: "Zane Maloney", number: 21, code: "MAL", flag: "🇧🇧",
      teamColor: "#D4AF37", helmetMain: "#1D4ED8", helmetAccent: "#FBBF24",
      visorColor: "#06B6D4", suitColor: "#0A0A0A", pattern: "trident"
    }
  };

  const TEAM_CAR_PROFILES = {
    ferrari: {
      name: "Ferrari", model: "SF-24 / 2026", color: "#E80020",
      accent: "#FFEB3B", carbon: "#121212", wingColor: "#0A0A0A",
      tagline: "Scuderia Ferrari", halo: "#E80020"
    },
    mclaren: {
      name: "McLaren", model: "MCL38 / 2026", color: "#FF8000",
      accent: "#47C7FC", carbon: "#141416", wingColor: "#1E1E22",
      tagline: "Papaya Aerodynamics", halo: "#FF8000"
    },
    redbull: {
      name: "Red Bull Racing", model: "RB20 / 2026", color: "#141E30",
      accent: "#FFCC00", carbon: "#0E131F", wingColor: "#D62828",
      tagline: "Oracle Ground Effect", halo: "#141E30"
    },
    mercedes: {
      name: "Mercedes-AMG", model: "W15 / 2026", color: "#00A19B",
      accent: "#E2E8F0", carbon: "#0D1117", wingColor: "#00A19B",
      tagline: "Silver Arrow Hybrid", halo: "#C0C0C0"
    },
    astonmartin: {
      name: "Aston Martin", model: "AMR24 / 2026", color: "#00594F",
      accent: "#CEDC00", carbon: "#0B1D19", wingColor: "#00473F",
      tagline: "Aramco British Racing", halo: "#00594F"
    },
    alpine: {
      name: "Alpine", model: "A524 / 2026", color: "#0090FF",
      accent: "#FF87BC", carbon: "#111827", wingColor: "#0077D4",
      tagline: "BWT Dieppe Speed", halo: "#FF87BC"
    },
    williams: {
      name: "Williams", model: "FW46 / 2026", color: "#002B49",
      accent: "#00A3E0", carbon: "#081626", wingColor: "#001F35",
      tagline: "Grove Heritage Racing", halo: "#00A3E0"
    },
    vcarb: {
      name: "VCARB", model: "VCARB 01 / 2026", color: "#1634CB",
      accent: "#FFFFFF", carbon: "#0C1D74", wingColor: "#E10600",
      tagline: "Faenza Red Bull Toro", halo: "#1634CB"
    },
    audi: {
      name: "Audi / Kick Sauber", model: "C44 / Project 2026", color: "#1E2229",
      accent: "#52E252", carbon: "#0F1115", wingColor: "#52E252",
      tagline: "Neuburg Four Rings Era", halo: "#52E252"
    },
    haas: {
      name: "Haas", model: "VF-24 / 2026", color: "#2B2D42",
      accent: "#E10600", carbon: "#15161E", wingColor: "#E10600",
      tagline: "Kannapolis Precision Aero", halo: "#E10600"
    },
    cadillac: {
      name: "Cadillac F1", model: "V-Series 01 / 2026", color: "#0F172A",
      accent: "#D4AF37", carbon: "#050914", wingColor: "#D4AF37",
      tagline: "General Motors Works", halo: "#D4AF37"
    }
  };

  /**
   * Generates a unique, styled SVG racing driver visual
   */
  function createDriverSvg(id) {
    const d = DRIVER_PROFILES[id] || {
      name: id, number: 0, code: "F1", flag: "🏁",
      teamColor: "#E10600", helmetMain: "#222", helmetAccent: "#E10600",
      visorColor: "#FFD700", suitColor: "#111", pattern: "speed"
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%" class="driver-illustration-svg">
      <defs>
        <linearGradient id="bgGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080A0E" />
          <stop offset="60%" stop-color="#121824" />
          <stop offset="100%" stop-color="${d.teamColor}" stop-opacity="0.25" />
        </linearGradient>
        <linearGradient id="helmetGrad_${id}" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="${d.helmetAccent}" />
          <stop offset="45%" stop-color="${d.helmetMain}" />
          <stop offset="100%" stop-color="#080A0E" />
        </linearGradient>
        <linearGradient id="visorGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="25%" stop-color="${d.visorColor}" />
          <stop offset="85%" stop-color="#080A0E" />
        </linearGradient>
        <linearGradient id="suitGrad_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${d.suitColor}" />
          <stop offset="100%" stop-color="#050608" />
        </linearGradient>
        <linearGradient id="gleamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="transparent" />
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.45" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <filter id="glow_${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <style>
          @keyframes visorSweep {
            0% { transform: translateX(-120px) skewX(-25deg); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateX(180px) skewX(-25deg); opacity: 0; }
          }
          @keyframes aeroPulse {
            0%, 100% { opacity: 0.25; stroke-dashoffset: 0; }
            50% { opacity: 0.7; stroke-dashoffset: 30; }
          }
          .sweep-gleam { animation: visorSweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          .aero-line { stroke-dasharray: 10, 15; animation: aeroPulse 3s linear infinite; }
        </style>
      </defs>

      <!-- Background with subtle technical grid -->
      <rect width="400" height="480" fill="url(#bgGrad_${id})" rx="16" />
      <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
        <line x1="0" y1="120" x2="400" y2="120" />
        <line x1="0" y1="240" x2="400" y2="240" />
        <line x1="0" y1="360" x2="400" y2="360" />
        <line x1="100" y1="0" x2="100" y2="480" />
        <line x1="200" y1="0" x2="200" y2="480" />
        <line x1="300" y1="0" x2="300" y2="480" />
      </g>

      <!-- High-tech backdrop glow ring -->
      <circle cx="200" cy="180" r="140" fill="none" stroke="${d.teamColor}" stroke-opacity="0.15" stroke-width="2" />
      <circle cx="200" cy="180" r="155" fill="none" stroke="${d.helmetAccent}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="8 12" />

      <!-- Aerodynamic Streamlines -->
      <path d="M 40 180 Q 120 140 200 130 T 360 170" fill="none" stroke="${d.teamColor}" stroke-width="1.5" class="aero-line" />
      <path d="M 30 220 Q 110 200 200 190 T 370 230" fill="none" stroke="${d.visorColor}" stroke-width="1" class="aero-line" />

      <!-- Driver Suit & Shoulders -->
      <g id="racing_suit">
        <!-- Main Torso / Shoulders -->
        <path d="M 60 480 L 100 330 C 130 300 170 290 200 290 C 230 290 270 300 300 330 L 340 480 Z" fill="url(#suitGrad_${id})" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <!-- Team Chest Livery Band -->
        <path d="M 110 360 L 290 360 L 295 400 L 105 400 Z" fill="${d.teamColor}" fill-opacity="0.85" />
        <!-- FIA Homologation Collar -->
        <path d="M 150 305 L 250 305 L 240 335 L 160 335 Z" fill="#181D26" stroke="${d.helmetAccent}" stroke-width="1" />
        <!-- HANS Device / Carbon Straps -->
        <path d="M 125 330 L 140 450 L 155 450 L 145 330 Z" fill="#0A0C10" stroke="rgba(255,255,255,0.08)" />
        <path d="M 275 330 L 260 450 L 245 450 L 255 330 Z" fill="#0A0C10" stroke="rgba(255,255,255,0.08)" />
        <!-- Driver Racing Number Badge -->
        <circle cx="200" cy="380" r="24" fill="#080A0E" stroke="${d.helmetAccent}" stroke-width="2" />
        <text x="200" y="388" font-family="'Russo One', 'Impact', sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">#${d.number}</text>
      </g>

      <!-- Racing Helmet -->
      <g id="racing_helmet">
        <!-- Helmet Base Shell Shadow -->
        <ellipse cx="200" cy="200" rx="95" ry="105" fill="#050608" opacity="0.6" filter="url(#glow_${id})" />

        <!-- Main Outer Shell -->
        <path d="M 115 190 C 115 105 150 70 200 70 C 250 70 285 105 285 190 C 285 240 265 275 240 282 L 160 282 C 135 275 115 240 115 190 Z" fill="url(#helmetGrad_${id})" stroke="rgba(255,255,255,0.2)" stroke-width="2" />

        <!-- Helmet Livery Aero Fin & Wings -->
        <path d="M 185 70 Q 200 60 215 70 L 210 115 L 190 115 Z" fill="${d.helmetAccent}" opacity="0.9" />
        <!-- Side Winglets -->
        <path d="M 115 170 L 135 155 L 135 195 L 115 190 Z" fill="${d.teamColor}" />
        <path d="M 285 170 L 265 155 L 265 195 L 285 190 Z" fill="${d.teamColor}" />

        <!-- Visor Bezel / Carbon Eyeport -->
        <path d="M 128 150 Q 200 135 272 150 L 265 215 Q 200 230 135 215 Z" fill="#08090C" stroke="${d.helmetAccent}" stroke-width="2" />

        <!-- Main Visor Surface -->
        <g clip-path="url(#visorClip_${id})">
          <clipPath id="visorClip_${id}">
            <path d="M 132 154 Q 200 140 268 154 L 262 210 Q 200 224 138 210 Z" />
          </clipPath>
          <path d="M 132 154 Q 200 140 268 154 L 262 210 Q 200 224 138 210 Z" fill="url(#visorGrad_${id})" />
          <!-- Animated Reflection Glare Sweep -->
          <rect x="100" y="130" width="70" height="110" fill="url(#gleamGrad)" class="sweep-gleam" />
        </g>

        <!-- Visor Tear-Off Post & Pivot Hubs -->
        <circle cx="132" cy="182" r="5" fill="#E2E8F0" stroke="#000" stroke-width="1.5" />
        <circle cx="268" cy="182" r="5" fill="#E2E8F0" stroke="#000" stroke-width="1.5" />

        <!-- Helmet Chin Vent / Aerodynamic Ducts -->
        <path d="M 175 245 L 225 245 L 220 265 L 180 265 Z" fill="#0B0D12" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <line x1="185" y1="255" x2="215" y2="255" stroke="${d.helmetAccent}" stroke-width="1.5" />

        <!-- Driver Initials Code Monogram -->
        <text x="200" y="112" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="800" fill="${d.helmetAccent}" letter-spacing="3" text-anchor="middle">${d.code}</text>
      </g>

      <!-- Badge Overlay Top Banner -->
      <g transform="translate(20, 24)">
        <rect width="110" height="28" rx="6" fill="#000000" fill-opacity="0.7" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="12" y="18" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#FFFFFF">${d.flag} ${d.code}</text>
        <circle cx="95" cy="14" r="5" fill="${d.teamColor}" />
      </g>

      <!-- Artistic Attribution Footnote -->
      <g transform="translate(20, 452)">
        <text font-family="'JetBrains Mono', monospace" font-size="10" fill="#8B949E" opacity="0.8">ORIGINAL MOTORSPORT ILLUSTRATION · ${d.name.toUpperCase()}</text>
      </g>
    </svg>`;
  }

  /**
   * Generates a unique, styled SVG racing car visual
   */
  function createTeamCarSvg(id) {
    const t = TEAM_CAR_PROFILES[id] || {
      name: id, model: "F1 2026", color: "#E10600",
      accent: "#FFFFFF", carbon: "#111", wingColor: "#E10600",
      tagline: "Formula 1 Team", halo: "#E10600"
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 320" width="100%" height="100%" class="team-car-illustration-svg">
      <defs>
        <linearGradient id="carBg_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080A0E" />
          <stop offset="60%" stop-color="#101520" />
          <stop offset="100%" stop-color="${t.color}" stop-opacity="0.25" />
        </linearGradient>
        <linearGradient id="bodyGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${t.wingColor}" />
          <stop offset="35%" stop-color="${t.color}" />
          <stop offset="70%" stop-color="${t.color}" />
          <stop offset="100%" stop-color="${t.carbon}" />
        </linearGradient>
        <linearGradient id="tireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2D3139" />
          <stop offset="50%" stop-color="#14171C" />
          <stop offset="100%" stop-color="#07090C" />
        </linearGradient>
        <linearGradient id="carbonTexture" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E232A" />
          <stop offset="100%" stop-color="#0A0C0F" />
        </linearGradient>
        <linearGradient id="speedSweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="transparent" />
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.5" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <filter id="carShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#000000" flood-opacity="0.8" />
        </filter>
        <style>
          @keyframes aeroFlow {
            0% { stroke-dashoffset: 200; opacity: 0.2; }
            50% { opacity: 0.8; }
            100% { stroke-dashoffset: 0; opacity: 0.2; }
          }
          @keyframes gleamCar {
            0% { transform: translateX(-300px) skewX(-30deg); opacity: 0; }
            40% { opacity: 0.6; }
            80% { transform: translateX(500px) skewX(-30deg); opacity: 0; }
            100% { transform: translateX(500px) skewX(-30deg); opacity: 0; }
          }
          .aero-stream { stroke-dasharray: 20, 25; animation: aeroFlow 2.8s linear infinite; }
          .car-gleam { animation: gleamCar 5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        </style>
      </defs>

      <!-- Background with Ground Speed Streaks -->
      <rect width="720" height="320" fill="url(#carBg_${id})" rx="16" />

      <!-- Speed & Downforce Vortex Lines -->
      <g stroke="${t.accent}" stroke-width="1.2" opacity="0.6">
        <path d="M 40 130 C 180 125 360 110 680 100" fill="none" class="aero-stream" />
        <path d="M 60 170 C 240 165 420 155 690 145" fill="none" class="aero-stream" />
        <path d="M 80 260 C 260 258 480 255 700 250" fill="none" class="aero-stream" stroke="${t.color}" stroke-width="1.5" />
      </g>

      <!-- Ground Tarmac Shadow -->
      <ellipse cx="370" cy="275" rx="310" ry="20" fill="#000000" opacity="0.75" />

      <!-- FORMULA 1 CAR SILHOUETTE (PROFILE 3/4 RACING STANCE) -->
      <g filter="url(#carShadow)">

        <!-- Rear Wing Elements & DRS Flap -->
        <g id="rear_wing">
          <!-- Main Rear Endplate -->
          <path d="M 85 105 L 140 105 L 135 195 L 95 195 Z" fill="${t.wingColor}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <!-- DRS Top Flap Profile -->
          <rect x="75" y="110" width="65" height="12" rx="3" fill="${t.accent}" />
          <!-- Lower Beam Wing -->
          <rect x="100" y="175" width="45" height="8" rx="2" fill="url(#carbonTexture)" />
          <!-- Exhaust Outlet Pipe -->
          <ellipse cx="145" cy="180" rx="7" ry="5" fill="#111" stroke="#F59E0B" stroke-width="1" />
        </g>

        <!-- Engine Cover Shark Fin & Airbox Intake -->
        <g id="airbox_shark_fin">
          <!-- Shark Fin -->
          <path d="M 140 125 L 290 95 L 290 140 L 140 165 Z" fill="url(#carbonTexture)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <!-- Airbox Intake Scoop -->
          <path d="M 285 92 L 315 90 L 320 135 L 285 140 Z" fill="${t.color}" stroke="${t.accent}" stroke-width="1.5" />
          <ellipse cx="310" cy="102" rx="6" ry="9" fill="#000000" />
          <!-- Camera Pod Yellow/Black -->
          <rect x="300" y="82" width="16" height="6" rx="2" fill="#EAB308" />
        </g>

        <!-- Main Monocoque Chassis & Sidepod Aerodynamics -->
        <g id="main_chassis">
          <!-- Main Body Shell Contour -->
          <path d="M 135 185 L 180 185 C 220 180 270 145 320 140 L 460 165 C 530 180 590 205 650 225 L 650 240 L 480 242 C 400 242 320 240 140 240 Z" fill="url(#bodyGrad_${id})" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

          <!-- Sidepod Undercut Channel & Radiator Louvers -->
          <path d="M 280 165 C 330 165 370 175 420 190 L 415 225 C 360 215 310 210 270 212 Z" fill="#090C10" stroke="${t.accent}" stroke-width="1" />
          <!-- Cooling Gills / Louvres -->
          <line x1="330" y1="178" x2="350" y2="175" stroke="${t.accent}" stroke-width="1.5" opacity="0.8" />
          <line x1="335" y1="184" x2="355" y2="181" stroke="${t.accent}" stroke-width="1.5" opacity="0.8" />
          <line x1="340" y1="190" x2="360" y2="187" stroke="${t.accent}" stroke-width="1.5" opacity="0.8" />

          <!-- Team Livery Accent Swish Stripe -->
          <path d="M 190 190 Q 320 155 450 185 L 470 195 Q 330 170 185 200 Z" fill="${t.accent}" />

          <!-- Dynamic Light Reflection Gleam across Car -->
          <g clip-path="url(#chassisClip_${id})">
            <clipPath id="chassisClip_${id}">
              <path d="M 135 185 L 180 185 C 220 180 270 145 320 140 L 460 165 C 530 180 590 205 650 225 L 650 240 L 140 240 Z" />
            </clipPath>
            <rect x="100" y="90" width="120" height="160" fill="url(#speedSweep)" class="car-gleam" />
          </g>

          <!-- Halo Cockpit Protection Structure -->
          <path d="M 330 140 C 355 125 390 125 410 145 L 395 155 C 380 140 360 140 340 152 Z" fill="${t.halo}" stroke="#000" stroke-width="1" />
          <!-- Driver Helmet Inside Cockpit -->
          <circle cx="365" cy="142" r="13" fill="#1E293B" stroke="${t.accent}" stroke-width="1.5" />
          <path d="M 368 138 Q 378 140 376 146 Q 368 147 366 143 Z" fill="#FFD700" />
        </g>

        <!-- Long Slender Nosecone & Front Wing Assembly -->
        <g id="front_wing">
          <!-- Nosecone Tip -->
          <path d="M 540 205 L 665 228 L 665 235 L 535 218 Z" fill="${t.color}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <!-- Multi-Element Front Wing Cascades -->
          <path d="M 620 225 L 690 235 L 685 258 L 610 248 Z" fill="${t.wingColor}" stroke="${t.accent}" stroke-width="1" />
          <path d="M 630 220 L 685 230 L 680 240 L 625 232 Z" fill="${t.accent}" opacity="0.9" />
          <!-- Front Wing Endplate with Outwash Flare -->
          <path d="M 670 215 L 705 225 L 700 262 L 665 252 Z" fill="url(#carbonTexture)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
        </g>

        <!-- High-Performance Pirelli 18-inch Wheels & Aerodynamic Wheel Covers -->
        <!-- REAR WHEEL -->
        <g id="rear_wheel" transform="translate(195, 230)">
          <!-- Outer Tire Rubber -->
          <circle cx="0" cy="0" r="48" fill="url(#tireGrad)" stroke="#050608" stroke-width="2" />
          <!-- Red Soft Pirelli Strip -->
          <circle cx="0" cy="0" r="44" fill="none" stroke="#E10600" stroke-width="3" stroke-dasharray="14 4" />
          <!-- Aero Wheel Cover Rim -->
          <circle cx="0" cy="0" r="34" fill="url(#carbonTexture)" stroke="${t.color}" stroke-width="2" />
          <!-- Center Nut -->
          <circle cx="0" cy="0" r="10" fill="#E2E8F0" stroke="#000" stroke-width="1" />
        </g>

        <!-- FRONT WHEEL -->
        <g id="front_wheel" transform="translate(565, 232)">
          <!-- Outer Tire Rubber -->
          <circle cx="0" cy="0" r="46" fill="url(#tireGrad)" stroke="#050608" stroke-width="2" />
          <!-- Red Soft Pirelli Strip -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="#E10600" stroke-width="3" stroke-dasharray="14 4" />
          <!-- Aero Wheel Cover Rim -->
          <circle cx="0" cy="0" r="32" fill="url(#carbonTexture)" stroke="${t.color}" stroke-width="2" />
          <!-- Center Nut -->
          <circle cx="0" cy="0" r="9" fill="#E2E8F0" stroke="#000" stroke-width="1" />
        </g>
      </g>

      <!-- Badge Overlay Top Left -->
      <g transform="translate(24, 24)">
        <rect width="210" height="34" rx="8" fill="#000000" fill-opacity="0.75" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <circle cx="18" cy="17" r="6" fill="${t.color}" />
        <text x="32" y="22" font-family="'Russo One', sans-serif" font-size="13" font-weight="900" fill="#FFFFFF">${t.name.toUpperCase()}</text>
        <text x="145" y="21" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="${t.accent}">${t.model}</text>
      </g>

      <!-- Subtitle Tagline Bottom Left -->
      <g transform="translate(24, 296)">
        <text font-family="'JetBrains Mono', monospace" font-size="10" fill="#8B949E" opacity="0.8">BESPOKE 3D LIVERY ILLUSTRATION · ${t.tagline.toUpperCase()}</text>
      </g>
    </svg>`;
  }

  function getDriverIllustration(id) {
    const svg = createDriverSvg(id);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function getTeamCarIllustration(id) {
    const svg = createTeamCarSvg(id);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  return {
    DRIVER_PROFILES,
    TEAM_CAR_PROFILES,
    createDriverSvg,
    createTeamCarSvg,
    getDriverIllustration,
    getTeamCarIllustration
  };
})();

if (typeof window !== 'undefined') window.F1_VISUALS = F1_VISUALS;
if (typeof globalThis !== 'undefined') globalThis.F1_VISUALS = F1_VISUALS;
if (typeof module !== 'undefined' && module.exports) module.exports = F1_VISUALS;

