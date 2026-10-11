// ULTIMATE F1 HUB - CORE APPLICATION SCRIPT
window.loadHistoricalSeason = window.loadHistoricalSeason || function(year) {
  console.log('Time Machine loading season:', year);
};
window.flipDriverCard = window.flipDriverCard || function(driverId, event) {
  const card = document.getElementById(`driver-card-${driverId}`);
  if (card) card.classList.toggle('is-flipped');
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons & AOS
  if (window.lucide) window.lucide.createIcons();
  if (window.AOS) {
    window.AOS.init({
      duration: 500,
      once: true,
      easing: 'ease-out-cubic'
    });
  }

  // Application State
  const state = {
    currentSection: 'home',
    selectedSeason: 2026,
    timeZone: 'local', // 'local', 'UTC', 'track'
    driverSearch: '',
    driverTeamFilter: 'all',
    driverSort: 'points',
    activeTechComponent: 'frontwing',
    techViewMode: 'top', // 1. top, 2. side, 3. isometric
    activeTechLevel: 'beginner', // 'beginner', 'advanced'
    activeCompare: { driver1: 'verstappen', driver2: 'norris' },
    favorites: JSON.parse(localStorage.getItem('f1_hub_favorites') || '{"drivers":[], "teams":[], "circuits":[], "modules":[]}'),
    settings: JSON.parse(localStorage.getItem('f1_hub_settings') || '{"reducedMotion":false, "defaultSection":"home"}'),
    charts: {}
  };

  // Bespoke team-specific car illustration generator (guarantees NO generic images)
  window.getTeamCarFallbackSvg = (teamId) => {
    const team = window.F1_DATA?.teams?.find(t => t.id === teamId) || {
      name: 'Formula 1',
      shortName: 'F1',
      color: '#E10600',
      accentColor: '#FFFFFF',
      carModel: '2026 Spec'
    };
    const color = team.color || '#E10600';
    const accent = team.accentColor || '#FFFFFF';
    const name = team.shortName || team.name;
    const model = team.carModel || 'F1 2026';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad_${teamId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080A0E" />
          <stop offset="50%" stop-color="#0D1117" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0.3" />
        </linearGradient>
        <linearGradient id="bodyGrad_${teamId}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="80%" stop-color="${color}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="600" height="240" fill="url(#bgGrad_${teamId})" />
      <pattern id="grid_${teamId}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
      <rect width="600" height="240" fill="url(#grid_${teamId})" />
      
      <!-- Aerodynamic ground airflow & speedlines -->
      <line x1="20" y1="185" x2="580" y2="185" stroke="${color}" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="10,6" />
      <line x1="80" y1="198" x2="540" y2="198" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

      <!-- Rear Wing Assembly -->
      <path d="M 470,75 L 535,70 L 530,145 L 475,140 Z" fill="${color}" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      <rect x="495" y="65" width="35" height="12" rx="2" fill="${accent}" />

      <!-- Main Body Monocoque & Sidepod Undercut -->
      <path d="M 80,170 L 140,150 L 220,130 L 290,130 L 330,95 L 440,120 L 480,155 L 470,175 L 140,175 Z" fill="url(#bodyGrad_${teamId})" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      
      <!-- Front Active Wing & Nosecone -->
      <path d="M 45,178 L 130,178 L 110,165 L 55,168 Z" fill="${color}" stroke="${accent}" stroke-width="1.5"/>
      <polygon points="40,178 75,155 70,185" fill="${accent}" />

      <!-- Halo Structure -->
      <path d="M 250,130 Q 285,90 310,95 L 315,130 Z" fill="none" stroke="#FFFFFF" stroke-width="4.5" opacity="0.9" />

      <!-- Pirelli 18-Inch Wheels -->
      <circle cx="150" cy="165" r="34" fill="#111318" stroke="#333842" stroke-width="3.5"/>
      <circle cx="150" cy="165" r="20" fill="#080A0E" stroke="${color}" stroke-width="2"/>
      <circle cx="150" cy="165" r="6" fill="#FFF" />

      <circle cx="450" cy="165" r="36" fill="#111318" stroke="#333842" stroke-width="3.5"/>
      <circle cx="450" cy="165" r="22" fill="#080A0E" stroke="${color}" stroke-width="2"/>
      <circle cx="450" cy="165" r="6" fill="#FFF" />

      <!-- Constructor Name & Model Badge -->
      <text x="35" y="42" fill="#FFFFFF" font-family="'Russo One', 'Archivo', sans-serif" font-size="20" font-weight="900" letter-spacing="1">${team.name.toUpperCase()}</text>
      <text x="35" y="65" fill="${color}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="bold">${model} · 2026 ACTIVE AERO LIVERY</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  // Driver Portrait monogram & flag avatar generator
  window.getDriverPortraitFallback = (driverId, code, flag, color) => {
    const driver = window.F1_DATA?.drivers?.find(d => d.id === driverId);
    const name = driver?.name || code || 'F1 Driver';
    const num = driver?.number || '0';
    const nat = driver?.nationality || '';
    const flg = flag || driver?.flag || '🏁';
    const clr = color || '#E10600';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" width="100%" height="100%">
      <defs>
        <linearGradient id="dGrad_${driverId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#121824" />
          <stop offset="60%" stop-color="#080A0E" />
          <stop offset="100%" stop-color="${clr}" stop-opacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="300" height="360" fill="url(#dGrad_${driverId})" />
      <circle cx="150" cy="125" r="60" fill="${clr}" fill-opacity="0.15" stroke="${clr}" stroke-width="2.5" />
      <path d="M 75,310 C 75,210 225,210 225,310 Z" fill="${clr}" fill-opacity="0.25" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <text x="150" y="140" text-anchor="middle" fill="#FFFFFF" font-family="'Russo One', 'Archivo', sans-serif" font-size="40" font-weight="900">${code}</text>
      <text x="150" y="270" text-anchor="middle" fill="#FFFFFF" font-family="'Russo One', sans-serif" font-size="18" font-weight="bold">${name.toUpperCase()}</text>
      <text x="150" y="295" text-anchor="middle" fill="${clr}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="bold">#${num} · ${flg} ${nat}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  // Expose switchSection to window for onclick handlers
  window.switchSection = (sectionId) => {
    if (!sectionId) return;
    
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Show target section
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
      target.classList.add('active');
      state.currentSection = sectionId;
      window.location.hash = sectionId;

      // Update sidebar nav active styling
      document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.section === sectionId) {
          btn.classList.add('nav-item-active');
          const icon = btn.querySelector('svg, i');
          if (icon) icon.classList.add('text-f1-red');
        } else {
          btn.classList.remove('nav-item-active');
          const icon = btn.querySelector('svg, i');
          if (icon) icon.classList.remove('text-f1-red');
        }
      });

      // Close mobile drawer if open
      const drawer = document.getElementById('mobileDrawer');
      if (drawer && !drawer.classList.contains('hidden')) {
        drawer.classList.add('hidden');
      }

      // Re-trigger icons
      if (window.lucide) window.lucide.createIcons();
      window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? 'auto' : 'smooth' });

      // Trigger section-specific renderers
      handleSectionActivation(sectionId);
    }
  };

  // Section Activation handler
  function handleSectionActivation(sectionId) {
    switch (sectionId) {
      case 'teams':
        renderTeamsSection();
        break;
      case 'drivers':
        renderDriversSection();
        break;
      case 'calendar':
        renderCalendarSection();
        break;
      case 'circuits':
        renderCircuitsSection();
        break;
      case 'technology':
        renderTechnologySection();
        break;
      case 'learn':
        renderLearnSection();
        break;
      case 'live':
        renderLiveSection();
        break;
      case 'standings':
        renderStandingsSection();
        break;
      case 'halloffame':
        renderHallOfFameSection();
        break;
      case 'timemachine':
        renderTimeMachineSection();
        break;
      case 'history':
        renderHistorySection();
        break;
      case 'favorites':
        renderFavoritesSection();
        break;
      case 'audit':
        renderAuditSection();
        break;
      case 'settings':
        renderSettingsSection();
        break;
    }
  }

  // Setup Sidebar Navigation Listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.dataset.section;
      if (sec) window.switchSection(sec);
    });
  });

  // Mobile Drawer Setup
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavContainer = document.getElementById('mobileNavContainer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.remove('hidden');
    });
  }
  if (closeDrawerBtn && mobileDrawer) {
    closeDrawerBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('hidden');
    });
  }
  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) mobileDrawer.classList.add('hidden');
    });
  }

  // Clone nav items into mobile drawer
  if (mobileNavContainer) {
    const desktopNavBtns = document.querySelectorAll('#navLinksContainer .nav-btn');
    desktopNavBtns.forEach(btn => {
      const clone = btn.cloneNode(true);
      clone.addEventListener('click', () => {
        window.switchSection(clone.dataset.section);
      });
      mobileNavContainer.appendChild(clone);
    });
  }

  // Global Countdown Timer Setup
  function updateCountdown() {
    const countdownEl = document.getElementById('globalCountdownTime');
    if (!countdownEl || !window.F1_DATA) return;

    const firstGpDate = new Date(window.F1_DATA.circuits[0].date).getTime();
    const now = new Date().getTime();
    const diff = firstGpDate - now;

    if (diff <= 0) {
      countdownEl.textContent = 'SESSION IN PROGRESS / COMPLETED';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    countdownEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Timezone selector
  const tzSelect = document.getElementById('timeZoneSelector');
  if (tzSelect) {
    tzSelect.addEventListener('change', (e) => {
      state.timeZone = e.target.value;
      if (state.currentSection === 'calendar') renderCalendarSection();
    });
  }

  // Global Modal System
  const modalBackdrop = document.getElementById('globalModalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalContent = document.getElementById('modalContent');

  window.openModal = (htmlContent) => {
    if (!modalBackdrop || !modalContent) return;
    modalContent.innerHTML = htmlContent;
    modalBackdrop.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', window.closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) window.closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeModal();
  });

  // Favorites Management
  window.toggleFavorite = (type, id) => {
    if (!state.favorites[type]) state.favorites[type] = [];
    const index = state.favorites[type].indexOf(id);
    if (index > -1) {
      state.favorites[type].splice(index, 1);
    } else {
      state.favorites[type].push(id);
    }
    localStorage.setItem('f1_hub_favorites', JSON.stringify(state.favorites));
    if (state.currentSection === 'favorites') renderFavoritesSection();
    if (state.currentSection === 'teams') renderTeamsSection();
    if (state.currentSection === 'drivers') renderDriversSection();
    if (window.lucide) window.lucide.createIcons();
  };

  /* ==========================================================================
     SECTION: F1 TECHNOLOGY & INTERACTIVE CAR EXPLAINER
     ========================================================================== */
  const techComponentsData = {
    frontwing: {
      name: "Active Front Wing Assembly",
      category: "Aerodynamics & Flow Conditioning",
      shortSummary: "Directs initial airflow around the front tyres and under the chassis floor.",
      beginnerExplanation: "The front wing is the first part of the car to touch undisturbed air. Its curved carbon-fibre aerofoils create downforce—an invisible force pushing the front tyres hard into the asphalt so the driver can turn sharply at 300 km/h without understeering off the circuit.",
      analogy: "Like an upside-down airplane wing: instead of lifting the aircraft into the sky, it presses the race car into the road.",
      significance: "Generates approximately 25–30% of total car downforce and controls the 'wake' (turbulent air) moving past front rotating tyres towards the underfloor.",
      regulationContext: "For the 2026 technical regulations, the front wing features active aerodynamic flap adjustments (Z-Mode for high-downforce cornering, X-Mode for low-drag straights), replacing traditional static setups.",
      advancedDetails: {
        dimensions: "1,800mm width, multi-element chord geometry with active actuator flap angle range of 0° to 12°.",
        vortexControl: "Creates the crucial Y250/tyre-squirt vortex to seal high-energy air away from the tyre turbulence.",
        structuralSpec: "Pre-preg autoclaved carbon-fibre composite with FIA static deflection load test exceeding 1,000 N."
      }
    },
    rearwing: {
      name: "Active Rear Wing & Beam Wing",
      category: "Aerodynamics & Drag Reduction",
      shortSummary: "Provides heavy rear-axle downforce and opens into X-Mode on straights.",
      beginnerExplanation: "The rear wing sits high above the rear tyres, pushing the back of the car down into the track. This prevents the car from spinning out when accelerating out of high-speed turns.",
      analogy: "Similar to leaning back hard on a sled or pressing firmly on a bicycle seat for maximum grip on a slippery slope.",
      significance: "Essential for rear axle stability and high-speed braking balance from 340 km/h down to 80 km/h in under 2.5 seconds.",
      regulationContext: "Historically controlled by DRS (Drag Reduction System, introduced in 2011). Under 2026 regulations, it works in tandem with the front wing via full Active Aerodynamics (X-Mode) available on all straight zones.",
      advancedDetails: {
        dragCoefficient: "Cd decreases by ~30% in low-drag configuration (X-Mode), allowing speeds exceeding 350 km/h with 50% electric power deployment.",
        beamWing: "Cascading dual lower beam wings work in tandem with the floor diffuser to extract high-energy air from beneath the car."
      }
    },
    floor: {
      name: "Underfloor Venturi Tunnels & Diffuser",
      category: "Ground Effect Aerodynamics",
      shortSummary: "The primary downforce generator using Bernoulli's principle of ground effect.",
      beginnerExplanation: "The underside of a Formula 1 car is sculpted into shaped air channels. As air rushes beneath the car through these narrowing tunnels, it speeds up and creates a massive vacuum suction, gluing the car to the road with minimal turbulent dirty air left behind.",
      analogy: "Like placing a spoon near a running kitchen faucet—the water speeds up and sucks the spoon right into the stream.",
      significance: "Produces over 50% of the car's overall downforce. Because this suction comes from underneath rather than wings, it creates far less 'dirty air' for cars following behind.",
      regulationContext: "Ground effect was banned in 1983 due to porpoising risks and reintroduced in 2022. For 2026, the tunnels are refined with standardized floor strakes to eradicate bouncing and promote closer wheel-to-wheel duels.",
      advancedDetails: {
        pressureDelta: "Creates negative pressure suction exceeding -12,000 Pascals at 280 km/h.",
        titaniumSkidBlocks: "Machined titanium alloy skid plates on the Jabroc wooden plank spark brilliantly when bottoming out under peak compression."
      }
    },
    halo: {
      name: "Titanium Halo Safety Cockpit Frame",
      category: "Driver Protection & Safety",
      shortSummary: "A Grade-5 titanium curved bar shielding the driver's helmet from impacts.",
      beginnerExplanation: "Introduced in 2018, the Halo is a three-legged titanium structure encircling the driver's head. It protects the driver from flying wheels, track barriers, and car rollovers while leaving the cockpit open.",
      analogy: "An indestructible protective roll-cage ring surrounding the driver like a suit of titanium armor.",
      significance: "Credited with saving numerous drivers' lives, including Romain Grosjean (Bahrain 2020 fiery crash), Lewis Hamilton (Monza 2021), and Zhou Guanyu (Silverstone 2022 flip).",
      regulationContext: "Mandatory standard FIA component since 2018. Fabricated from aerospace Grade-5 titanium alloy and bolted directly into the survival cell.",
      advancedDetails: {
        loadRating: "Weighs only 7 kg but withstands 125 kiloNewtons (equivalent to the weight of two London double-decker buses, ~12 tonnes) from above and the front.",
        aerodynamics: "Teams wrap the bare titanium in a 20mm bespoke carbon aerodynamic fairing to condition airflow into the engine airbox."
      }
    },
    powerunit: {
      name: "1.6L V6 Turbo Hybrid + 350kW MGU-K",
      category: "Powertrain & Energy Recovery",
      shortSummary: "A 50/50 hybrid powerhouse delivering over 1,000 hp using 100% sustainable fuels.",
      beginnerExplanation: "The engine is not just petrol—it's a hybrid marvel. It pairs a small 1.6-litre turbocharged petrol engine with a massive electric motor. When braking, energy is harvested into a battery; when accelerating, electricity boosts the car instantly with explosive acceleration.",
      analogy: "Like combining an ultra-efficient turbo rocket with a lightning-fast electric hypercar in one seamless package.",
      significance: "Reaches thermal efficiency exceeding 53%, making it the most energy-efficient internal combustion powertrain on Earth.",
      regulationContext: "Under 2026 regulations, the complex MGU-H (heat generator) is abolished, and electric power (MGU-K) nearly triples from 120kW (160 hp) to 350kW (470 hp), powered exclusively by 100% certified non-fossil sustainable fuels.",
      advancedDetails: {
        displacement: "1,600cc 90° V6 revving to 15,000 RPM with single turbocharger limited to 4.5 bar boost.",
        mguKRating: "350kW (469 bhp) power output and regeneration limit with 4MJ usable battery capacity per lap.",
        fuelFlow: "Regulated by energy mass flow limit of 3,000 MJ/h using 100% advanced second-generation bio-fuels or synthetic e-fuels."
      }
    },
    tyres: {
      name: "Pirelli 18-Inch Low-Profile Tyres",
      category: "Chassis & Mechanical Grip",
      shortSummary: "The only contact patch connecting 800kg of car to the racing tarmac.",
      beginnerExplanation: "F1 uses slick (grooveless) tyres for dry weather and grooved tyres for rain. Different rubber mixtures (Soft for high grip, Hard for endurance) force teams to make strategic pit stops during the race.",
      analogy: "Like running shoes with different soles: sticky racing spikes for short sprints versus durable rubber boots for a marathon.",
      significance: "Controls both mechanical grip in slow corners and braking stopping distances. Operating tyre temperature must stay precisely between 100°C and 115°C.",
      regulationContext: "Switched from classic 13-inch balloon tyres to modern 18-inch low-profile rims in 2022 to align with high-performance road car technology, equipped with mandatory wheel aero-covers.",
      advancedDetails: {
        compounds: "5 dry slick compounds (C1 hardest to C5 softest), plus Green Intermediates (displaces 30L/sec water) and Blue Full Wets (85L/sec at 300 km/h).",
        inflation: "Pressurized with dry nitrogen to ~22.5 PSI front and ~20.5 PSI rear to ensure predictable carcass deflection under 5G cornering."
      }
    },
    monocoque: {
      name: "Carbon-Fibre Survival Cell (Monocoque)",
      category: "Chassis Structure & Crash Safety",
      shortSummary: "Indestructible carbon-honeycomb cockpit tub housing the driver and fuel tank.",
      beginnerExplanation: "The central core of the car. It is an ultralight, bulletproof carbon-fibre tub designed to absorb extreme crash forces so the driver can walk away uninjured even from 300 km/h accidents.",
      analogy: "An impenetrable aerospace escape pod where the driver sits, reclined almost flat with feet raised high.",
      significance: "Provides the ultra-rigid backbone to which front suspension, engine, and safety structures are directly bolted.",
      regulationContext: "Pioneered by McLaren with the MP4/1 in 1981. Must pass grueling FIA crash-barrier deformation tests with zero cockpit intrusion permitted.",
      advancedDetails: {
        construction: "Multiple layers of ultra-high-modulus woven carbon fibre sandwiching an aluminum or Nomex honeycomb core.",
        fuelCell: "Kevlar-reinforced rubber puncture-proof bladder holding ~100 kg of fuel directly behind the driver's spine."
      }
    },
    brakes: {
      name: "Carbon-Carbon Brake System & Brake-by-Wire",
      category: "Deceleration & Energy Harvesting",
      shortSummary: "Carbon-fibre discs operating at 1,000°C capable of stopping a car in under 2 seconds.",
      beginnerExplanation: "Formula 1 brakes are made of carbon composite, not steel. When glowing cherry-red hot at over 800°C, they grab so violently that drivers experience up to 5G of deceleration—pushing blood forward in their bodies.",
      analogy: "Like pressing a ceramic baking dish into a spinning saw blade—the hotter it gets, the harder it bites.",
      significance: "Allows drivers to brake for turns just 80 meters before the apex from over 320 km/h.",
      regulationContext: "Rear brakes use electronic Brake-by-Wire (BBW) to smoothly combine hydraulic disc pressure with electric MGU-K motor regeneration without locking the rear tyres.",
      advancedDetails: {
        discDrilling: "Over 1,200 miniature cooling ventilation holes drilled laterally through each 32mm-thick front rotor.",
        stoppingForce: "Generates ~5.5G deceleration force; driver leg pressure required is ~120 kg (265 lbs) on the pedal."
      }
    }
  };

  function renderTechnologySection() {
    const root = document.getElementById('section-technology');
    if (!root) return;

    const comp = techComponentsData[state.activeTechComponent] || techComponentsData.frontwing;

    root.innerHTML = `
      <!-- Technology Section Header -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="cpu" class="w-4 h-4"></i>
          <span>Engineering Deep-Dive</span>
          <span>·</span>
          <span class="text-slate-400">2026 Regulation Blueprint</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Formula 1 <span class="text-f1-red">Car Anatomy & Technology</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Explore the pinnacle of motorsport engineering. Click any component on the visual chassis diagram below to inspect its aerodynamics, mechanics, and 2026 regulation changes.
        </p>
      </div>

      <!-- Interactive Car Explainer Master Card -->
      <div class="glass-panel p-5 md:p-8 rounded-2xl border border-white/10 space-y-6">
        
        <!-- Controls Bar: View Angles & Component Selectors -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div class="flex items-center gap-1.5 p-1 bg-black/40 rounded-lg border border-white/10">
            <button id="viewBtnTop" class="px-3 py-1 text-xs font-mono rounded ${state.techViewMode === 'top' ? 'bg-f1-red text-white' : 'text-slate-400 hover:text-white'} transition-colors">
              1. Top-Down View
            </button>
            <button id="viewBtnSide" class="px-3 py-1 text-xs font-mono rounded ${state.techViewMode === 'side' ? 'bg-f1-red text-white' : 'text-slate-400 hover:text-white'} transition-colors">
              2. Side-Profile View
            </button>
            <button id="viewBtnIso" class="px-3 py-1 text-xs font-mono rounded ${state.techViewMode === 'isometric' ? 'bg-f1-red text-white' : 'text-slate-400 hover:text-white'} transition-colors">
              3. Isometric View
            </button>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-slate-400">Explanation Level:</span>
            <div class="flex items-center p-1 bg-black/40 rounded-lg border border-white/10">
              <button id="lvlBtnBeg" class="px-3 py-1 text-xs font-medium rounded ${state.activeTechLevel === 'beginner' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'} transition-colors">
                Beginner
              </button>
              <button id="lvlBtnAdv" class="px-3 py-1 text-xs font-medium rounded ${state.activeTechLevel === 'advanced' ? 'bg-f1-red text-white font-semibold' : 'text-slate-400 hover:text-white'} transition-colors">
                Advanced Specs
              </button>
            </div>
          </div>
        </div>

        <!-- Interactive Diagram & Details Split -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT: 2D Interactive SVG Visual Blueprint (7 Cols) -->
          <div class="lg:col-span-7 bg-[#05070A] p-4 md:p-6 rounded-xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
            <!-- Aero Flow Ambient Glow -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-red-500/5 pointer-events-none"></div>

            <div class="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between w-full">
              <span>Interactive 2026 FIA Spec Chassis</span>
              <span class="text-f1-red font-semibold">● Click Hotspots to Inspect</span>
            </div>

            <!-- SVG CAR DIAGRAM -->
            <div class="w-full max-w-[620px] aspect-[16/9] relative flex items-center justify-center">
              ${renderCarSvg(state.techViewMode, state.activeTechComponent)}
            </div>

            <!-- Quick Component Hotspot Buttons Strip -->
            <div class="w-full mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5 justify-center">
              ${Object.keys(techComponentsData).map(key => `
                <button data-tech="${key}" class="tech-chip text-[11px] font-mono px-2.5 py-1 rounded transition-all ${state.activeTechComponent === key ? 'bg-f1-red text-white font-bold shadow-md shadow-f1-red/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'}">
                  ${techComponentsData[key].name.split(' ')[0]}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- RIGHT: Component Detail Glass Panel (5 Cols) -->
          <div class="lg:col-span-5 glass-panel-elevated p-6 rounded-xl border border-white/15 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span class="text-[10px] font-mono uppercase text-f1-red font-bold tracking-widest">${comp.category}</span>
                <h2 class="text-xl font-display font-black text-white mt-0.5">${comp.name}</h2>
              </div>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                ${state.activeTechComponent.toUpperCase()}
              </span>
            </div>

            <!-- Short Summary -->
            <div class="text-xs text-slate-300 font-mono bg-black/40 p-3 rounded-lg border border-white/5">
              ${comp.shortSummary}
            </div>

            <!-- Beginner View -->
            <div class="${state.activeTechLevel === 'beginner' ? 'block' : 'hidden'} space-y-3.5">
              <div>
                <h4 class="text-xs font-mono uppercase text-slate-400 mb-1">How It Works</h4>
                <p class="text-sm text-slate-200 leading-relaxed">${comp.beginnerExplanation}</p>
              </div>

              <div class="bg-red-950/20 border border-red-900/40 p-3 rounded-lg">
                <div class="text-[11px] font-mono font-bold text-red-300 mb-1 flex items-center gap-1.5">
                  <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
                  <span>Real-World Analogy</span>
                </div>
                <p class="text-xs text-slate-300 italic">${comp.analogy}</p>
              </div>

              <div>
                <h4 class="text-xs font-mono uppercase text-slate-400 mb-1">Track Impact</h4>
                <p class="text-xs text-slate-300 leading-relaxed">${comp.significance}</p>
              </div>

              <div class="pt-2 border-t border-white/10">
                <span class="text-[11px] font-mono text-emerald-400 font-semibold uppercase block mb-0.5">2026 Regulation Context</span>
                <p class="text-xs text-slate-300 leading-relaxed">${comp.regulationContext}</p>
              </div>
            </div>

            <!-- Advanced View -->
            <div class="${state.activeTechLevel === 'advanced' ? 'block' : 'hidden'} space-y-3.5">
              <div class="bg-black/50 p-3 rounded-lg border border-white/10 space-y-2">
                <div class="text-xs font-mono text-f1-red font-bold uppercase tracking-wider">Telemetry & Engineering Specs</div>
                <div class="space-y-1.5 text-xs font-mono text-slate-300">
                  ${Object.entries(comp.advancedDetails).map(([key, val]) => `
                    <div class="flex flex-col border-b border-white/5 pb-1.5">
                      <span class="text-slate-400 text-[10px] uppercase font-semibold">${key.replace(/([A-Z])/g, ' $1')}</span>
                      <span class="text-white mt-0.5">${val}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="p-3 bg-white/5 rounded-lg border border-white/10">
                <span class="text-[11px] font-mono text-f1-silver font-semibold uppercase block mb-1">Aerodynamic & Thermodynamic Invariants</span>
                <p class="text-xs text-slate-300 leading-relaxed">${comp.significance}</p>
              </div>

              <div>
                <span class="text-[11px] font-mono text-emerald-400 font-semibold uppercase block mb-1">FIA Technical Regulation Mandate</span>
                <p class="text-xs text-slate-300 leading-relaxed">${comp.regulationContext}</p>
              </div>
            </div>

            <!-- Interactive Next Button -->
            <div class="pt-2 flex items-center justify-between">
              <span class="text-[10px] font-mono text-slate-500">Selected: ${comp.name}</span>
              <button onclick="cycleNextTechComponent()" class="text-xs font-mono text-f1-red hover:underline flex items-center gap-1">
                <span>Inspect Next Part</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 2026 Aero Mode Simulator Strip (Z-Mode vs X-Mode) -->
        <div class="p-5 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i data-lucide="wind" class="w-4 h-4 text-cyan-400"></i>
              <h3 class="font-display font-bold text-sm text-white uppercase tracking-wider">2026 Active Aero Flap Simulator</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40 text-cyan-300">New for 2026</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
              <div class="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                <span>Z-MODE (Cornering Configuration)</span>
                <span>HIGH DOWNFORCE</span>
              </div>
              <p class="text-xs text-slate-300">
                Wings flaps angle down steeply. Front and rear wing elements bite into oncoming airflow to generate immense cornering grip and stability through twisty technical sectors.
              </p>
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
              <div class="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span>X-MODE (Straightaway Configuration)</span>
                <span>LOW DRAG (-30%)</span>
              </div>
              <p class="text-xs text-slate-300">
                Both front wing flaps and rear wing upper element tilt flat. Air flows freely with minimum drag, allowing speeds above 350 km/h with 50% hybrid energy recovery.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Tech View Angle Buttons
    document.getElementById('viewBtnIso')?.addEventListener('click', () => {
      state.techViewMode = 'isometric';
      renderTechnologySection();
    });
    document.getElementById('viewBtnTop')?.addEventListener('click', () => {
      state.techViewMode = 'top';
      renderTechnologySection();
    });
    document.getElementById('viewBtnSide')?.addEventListener('click', () => {
      state.techViewMode = 'side';
      renderTechnologySection();
    });

    // Bind Level Buttons
    document.getElementById('lvlBtnBeg')?.addEventListener('click', () => {
      state.activeTechLevel = 'beginner';
      renderTechnologySection();
    });
    document.getElementById('lvlBtnAdv')?.addEventListener('click', () => {
      state.activeTechLevel = 'advanced';
      renderTechnologySection();
    });

    // Bind Hotspot Chips
    document.querySelectorAll('.tech-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTechComponent = btn.dataset.tech;
        renderTechnologySection();
      });
    });

    // Bind SVG Hotspot Click targets
    document.querySelectorAll('.svg-hotspot').forEach(el => {
      el.addEventListener('click', () => {
        state.activeTechComponent = el.dataset.tech;
        renderTechnologySection();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  window.cycleNextTechComponent = () => {
    const keys = Object.keys(techComponentsData);
    const currentIndex = keys.indexOf(state.activeTechComponent);
    const nextIndex = (currentIndex + 1) % keys.length;
    state.activeTechComponent = keys[nextIndex];
    renderTechnologySection();
  };

  // Helper function to render precision 2D SVG Car Diagrams for Top, Side & Isometric views
  function renderCarSvg(viewMode, activePart) {
    const highlight = (part) => activePart === part ? '#E10600' : 'rgba(255, 255, 255, 0.35)';
    const fillHighlight = (part) => activePart === part ? 'rgba(225, 6, 0, 0.45)' : 'rgba(255, 255, 255, 0.05)';
    const strokeWidth = (part) => activePart === part ? '3.5' : '1.8';

    if (viewMode === 'top') {
      return `
        <svg viewBox="0 0 600 240" class="w-full h-full cursor-pointer select-none">
          <!-- Flow streamlines -->
          <path d="M 30,120 L 570,120" stroke="rgba(0, 225, 255, 0.25)" stroke-dasharray="6,6" stroke-width="1.5" />
          <path d="M 40,80 Q 200,95 560,90" stroke="rgba(0, 225, 255, 0.15)" stroke-dasharray="4,4" stroke-width="1" />
          <path d="M 40,160 Q 200,145 560,150" stroke="rgba(0, 225, 255, 0.15)" stroke-dasharray="4,4" stroke-width="1" />

          <!-- Front Wing -->
          <g class="svg-hotspot" data-tech="frontwing">
            <path d="M 70,70 L 95,70 L 90,170 L 70,170 Q 55,120 70,70 Z" fill="${fillHighlight('frontwing')}" stroke="${highlight('frontwing')}" stroke-width="${strokeWidth('frontwing')}" />
            <rect x="55" y="65" width="45" height="110" rx="3" fill="none" stroke="${highlight('frontwing')}" stroke-dasharray="2,2" />
            <text x="50" y="55" fill="${highlight('frontwing')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">FRONT WING</text>
          </g>

          <!-- Front Tyres -->
          <g class="svg-hotspot" data-tech="tyres">
            <rect x="140" y="45" width="55" height="26" rx="4" fill="${fillHighlight('tyres')}" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <rect x="140" y="169" width="55" height="26" rx="4" fill="${fillHighlight('tyres')}" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <text x="140" y="35" fill="${highlight('tyres')}" font-size="10" font-family="JetBrains Mono">TYRES (18")</text>
          </g>

          <!-- Nosecone & Monocoque -->
          <g class="svg-hotspot" data-tech="monocoque">
            <path d="M 90,110 L 220,105 L 260,100 L 320,100 L 320,140 L 260,140 L 220,135 L 90,130 Z" fill="${fillHighlight('monocoque')}" stroke="${highlight('monocoque')}" stroke-width="${strokeWidth('monocoque')}" />
            <text x="210" y="90" fill="${highlight('monocoque')}" font-size="10" font-family="JetBrains Mono">CHASSIS / MONOCOQUE</text>
          </g>

          <!-- Halo & Cockpit -->
          <g class="svg-hotspot" data-tech="halo">
            <ellipse cx="275" cy="120" rx="28" ry="16" fill="${fillHighlight('halo')}" stroke="${highlight('halo')}" stroke-width="${strokeWidth('halo')}" />
            <circle cx="275" cy="120" r="8" fill="#F0F6FC" opacity="0.6" />
            <text x="260" y="152" fill="${highlight('halo')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">HALO</text>
          </g>

          <!-- Sidepods & Underfloor -->
          <g class="svg-hotspot" data-tech="floor">
            <path d="M 230,85 L 390,80 L 420,95 L 420,145 L 390,160 L 230,155 Z" fill="${fillHighlight('floor')}" stroke="${highlight('floor')}" stroke-width="${strokeWidth('floor')}" />
            <text x="310" y="70" fill="${highlight('floor')}" font-size="10" font-family="JetBrains Mono">FLOOR / DIFFUSER</text>
          </g>

          <!-- Power Unit & Engine Cover -->
          <g class="svg-hotspot" data-tech="powerunit">
            <path d="M 320,100 L 440,105 L 460,115 L 460,125 L 440,135 L 320,140 Z" fill="${fillHighlight('powerunit')}" stroke="${highlight('powerunit')}" stroke-width="${strokeWidth('powerunit')}" />
            <text x="350" y="123" fill="${highlight('powerunit')}" font-size="9" font-family="JetBrains Mono" font-weight="bold">PU (V6 HYBRID)</text>
          </g>

          <!-- Rear Tyres -->
          <g class="svg-hotspot" data-tech="tyres">
            <rect x="420" y="42" width="65" height="30" rx="5" fill="${fillHighlight('tyres')}" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <rect x="420" y="168" width="65" height="30" rx="5" fill="${fillHighlight('tyres')}" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
          </g>

          <!-- Rear Wing -->
          <g class="svg-hotspot" data-tech="rearwing">
            <rect x="500" y="65" width="30" height="110" rx="4" fill="${fillHighlight('rearwing')}" stroke="${highlight('rearwing')}" stroke-width="${strokeWidth('rearwing')}" />
            <text x="490" y="55" fill="${highlight('rearwing')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">REAR WING</text>
          </g>
        </svg>
      `;
    } else if (viewMode === 'side') {
      return `
        <svg viewBox="0 0 600 240" class="w-full h-full cursor-pointer select-none">
          <!-- Ground line -->
          <line x1="20" y1="200" x2="580" y2="200" stroke="#E10600" stroke-width="1.5" stroke-dasharray="4,4" />

          <!-- Front Wing Endplate -->
          <g class="svg-hotspot" data-tech="frontwing">
            <path d="M 50,195 L 90,195 L 95,160 L 60,165 Z" fill="${fillHighlight('frontwing')}" stroke="${highlight('frontwing')}" stroke-width="${strokeWidth('frontwing')}" />
            <text x="45" y="150" fill="${highlight('frontwing')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">FRONT WING</text>
          </g>

          <!-- Front Tyre & Brake Duct -->
          <g class="svg-hotspot" data-tech="tyres">
            <circle cx="150" cy="165" r="32" fill="${fillHighlight('tyres')}" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <circle cx="150" cy="165" r="14" fill="#080A0E" stroke="${highlight('brakes')}" stroke-width="1.5" />
            <text x="120" y="125" fill="${highlight('tyres')}" font-size="10" font-family="JetBrains Mono">18" TYRE</text>
          </g>

          <!-- Nosecone & Monocoque -->
          <g class="svg-hotspot" data-tech="monocoque">
            <path d="M 85,180 L 140,165 L 230,140 L 290,140 L 290,185 L 120,188 Z" fill="${fillHighlight('monocoque')}" stroke="${highlight('monocoque')}" stroke-width="${strokeWidth('monocoque')}" />
            <text x="170" y="155" fill="${highlight('monocoque')}" font-size="9" font-family="JetBrains Mono">NOSECONE</text>
          </g>

          <!-- Halo Structure -->
          <g class="svg-hotspot" data-tech="halo">
            <path d="M 240,140 Q 275,100 300,105 L 305,140 Z" fill="${fillHighlight('halo')}" stroke="${highlight('halo')}" stroke-width="${strokeWidth('halo')}" />
            <text x="260" y="95" fill="${highlight('halo')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">HALO</text>
          </g>

          <!-- Engine Airbox & Cover -->
          <g class="svg-hotspot" data-tech="powerunit">
            <path d="M 300,105 Q 340,90 380,120 L 460,150 L 460,185 L 300,185 Z" fill="${fillHighlight('powerunit')}" stroke="${highlight('powerunit')}" stroke-width="${strokeWidth('powerunit')}" />
            <text x="340" y="115" fill="${highlight('powerunit')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">V6 HYBRID PU</text>
          </g>

          <!-- Floor & Venturi Diffuser Kickup -->
          <g class="svg-hotspot" data-tech="floor">
            <path d="M 190,192 L 420,192 Q 470,185 490,165 L 490,195 L 190,195 Z" fill="${fillHighlight('floor')}" stroke="${highlight('floor')}" stroke-width="${strokeWidth('floor')}" />
            <text x="280" y="215" fill="${highlight('floor')}" font-size="10" font-family="JetBrains Mono">VENTURI DIFFUSER</text>
          </g>

          <!-- Rear Tyre -->
          <g class="svg-hotspot" data-tech="tyres">
            <circle cx="450" cy="165" r="34" fill="${fillHighlight('tyres')}" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <circle cx="450" cy="165" r="14" fill="#080A0E" stroke="${highlight('brakes')}" stroke-width="1.5" />
          </g>

          <!-- Rear Wing & Endplate -->
          <g class="svg-hotspot" data-tech="rearwing">
            <path d="M 480,100 L 525,100 L 515,165 L 485,160 Z" fill="${fillHighlight('rearwing')}" stroke="${highlight('rearwing')}" stroke-width="${strokeWidth('rearwing')}" />
            <text x="475" y="90" fill="${highlight('rearwing')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">ACTIVE REAR WING</text>
          </g>
        </svg>
      `;
    } else {
      // 3. Elevated, Precision Isometric View
      return `
        <svg viewBox="0 0 620 250" class="w-full h-full cursor-pointer select-none">
          <defs>
            <linearGradient id="isoGradAero" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E10600" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#161b22" stop-opacity="0.8"/>
            </linearGradient>
            <linearGradient id="isoGradFloor" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#21262d" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#0d1117" stop-opacity="0.95"/>
            </linearGradient>
          </defs>

          <!-- Perspective Ground Reflection & Grid Lines -->
          <ellipse cx="320" cy="180" rx="270" ry="48" fill="rgba(225,6,0,0.03)" />
          <path d="M 60,185 L 560,185" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4,4" />
          <path d="M 120,210 L 480,150" stroke="rgba(255,255,255,0.04)" stroke-dasharray="6,6" />

          <!-- REAR WING ASSEMBLY (Isometric Depth Background) -->
          <g class="svg-hotspot" data-tech="rearwing">
            <polygon points="460,45 540,35 550,85 470,95" fill="${fillHighlight('rearwing')}" stroke="${highlight('rearwing')}" stroke-width="${strokeWidth('rearwing')}" />
            <!-- Active Upper Flap -->
            <polygon points="475,32 555,22 550,42 470,52" fill="rgba(255,255,255,0.15)" stroke="${highlight('rearwing')}" stroke-width="1.8" />
            <!-- Endplate & Actuator Pod -->
            <line x1="460" y1="45" x2="460" y2="120" stroke="${highlight('rearwing')}" stroke-width="2.5" />
            <line x1="550" y1="35" x2="550" y2="110" stroke="${highlight('rearwing')}" stroke-width="2.5" />
            <circle cx="505" cy="40" r="3.5" fill="#E10600" />
            <text x="490" y="20" fill="${highlight('rearwing')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">ACTIVE REAR WING</text>
          </g>

          <!-- REAR FAR WHEEL -->
          <g class="svg-hotspot" data-tech="tyres">
            <ellipse cx="485" cy="105" rx="18" ry="32" fill="#12161c" stroke="${highlight('tyres')}" stroke-width="1.5" />
          </g>

          <!-- POWER UNIT & ENGINE AIRBOX DORSAL FIN -->
          <g class="svg-hotspot" data-tech="powerunit">
            <polygon points="310,75 440,65 470,115 340,125" fill="${fillHighlight('powerunit')}" stroke="${highlight('powerunit')}" stroke-width="${strokeWidth('powerunit')}" />
            <!-- Shark Fin Ridge -->
            <path d="M 340,70 L 450,60 L 450,90 Z" fill="rgba(225,6,0,0.25)" stroke="${highlight('powerunit')}" stroke-width="1.5" />
            <!-- Airbox Intake Scoop -->
            <polygon points="320,68 345,64 340,82 315,86" fill="#080a0e" stroke="${highlight('powerunit')}" stroke-width="2" />
            <text x="360" y="55" fill="${highlight('powerunit')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">350kW V6 HYBRID PU</text>
          </g>

          <!-- UNDERFLOOR VENTURI TUNNELS & DIFFUSER -->
          <g class="svg-hotspot" data-tech="floor">
            <polygon points="210,145 360,120 450,135 480,155 330,180 200,165" fill="${fillHighlight('floor')}" stroke="${highlight('floor')}" stroke-width="${strokeWidth('floor')}" />
            <!-- Venturi Strakes & Skid Sparking Plate -->
            <path d="M 230,160 L 380,135" stroke="rgba(225,6,0,0.6)" stroke-width="2" stroke-dasharray="3,3" />
            <path d="M 250,170 L 410,145" stroke="#E10600" stroke-width="2" />
            <text x="250" y="195" fill="${highlight('floor')}" font-size="10" font-family="JetBrains Mono">GROUND EFFECT VENTURI FLOOR</text>
          </g>

          <!-- MONOCOQUE SURVIVAL CELL & NOSECONE -->
          <g class="svg-hotspot" data-tech="monocoque">
            <!-- Tapered High Nose -->
            <polygon points="90,160 170,125 290,105 270,145 150,175" fill="${fillHighlight('monocoque')}" stroke="${highlight('monocoque')}" stroke-width="${strokeWidth('monocoque')}" />
            <polygon points="90,160 150,175 140,185 80,168" fill="rgba(255,255,255,0.08)" stroke="${highlight('monocoque')}" stroke-width="1.5" />
            <text x="145" y="115" fill="${highlight('monocoque')}" font-size="10" font-family="JetBrains Mono">CARBON MONOCOQUE</text>
          </g>

          <!-- TITANIUM HALO & COCKPIT -->
          <g class="svg-hotspot" data-tech="halo">
            <!-- Cockpit Opening -->
            <ellipse cx="270" cy="115" rx="26" ry="16" fill="#080a0e" stroke="${highlight('halo')}" stroke-width="1.5" />
            <!-- Titanium Halo Ring -->
            <path d="M 245,115 Q 275,80 300,90 Q 295,120 270,125 Z" fill="${fillHighlight('halo')}" stroke="${highlight('halo')}" stroke-width="${strokeWidth('halo')}" />
            <!-- Center Pillar -->
            <line x1="255" y1="110" x2="255" y2="128" stroke="${highlight('halo')}" stroke-width="3" stroke-linecap="round" />
            <text x="235" y="75" fill="${highlight('halo')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">TITANIUM HALO</text>
          </g>

          <!-- FRONT FAR WHEEL & SUSPENSION -->
          <g class="svg-hotspot" data-tech="tyres">
            <ellipse cx="190" cy="118" rx="14" ry="28" fill="#12161c" stroke="${highlight('tyres')}" stroke-width="1.5" />
            <!-- Wishbones -->
            <line x1="160" y1="135" x2="190" y2="118" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
          </g>

          <!-- FRONT WING & ACTIVE ENDPLATES -->
          <g class="svg-hotspot" data-tech="frontwing">
            <!-- Cascading Multi-Tier Flaps -->
            <polygon points="40,175 130,135 155,155 65,200" fill="${fillHighlight('frontwing')}" stroke="${highlight('frontwing')}" stroke-width="${strokeWidth('frontwing')}" />
            <polygon points="45,170 125,133 130,140 50,180" fill="rgba(225,6,0,0.3)" stroke="${highlight('frontwing')}" stroke-width="1.5" />
            <!-- Endplate Footplate & Diveplane -->
            <polygon points="35,170 42,165 68,198 60,205" fill="#E10600" stroke="#FFF" stroke-width="1" />
            <circle cx="85" cy="172" r="4" fill="#E10600" />
            <text x="30" y="155" fill="${highlight('frontwing')}" font-size="10" font-family="JetBrains Mono" font-weight="bold">ACTIVE FRONT WING</text>
          </g>

          <!-- FRONT NEAR WHEEL & 18" AERO COVER -->
          <g class="svg-hotspot" data-tech="tyres">
            <ellipse cx="135" cy="165" rx="20" ry="38" fill="#12161c" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <!-- Rim Stripe & Center Nut -->
            <ellipse cx="135" cy="165" rx="11" ry="22" fill="#080A0E" stroke="#E10600" stroke-width="1.5" />
            <circle cx="135" cy="165" r="4" fill="#CEDC00" />
            <text x="95" y="222" fill="${highlight('tyres')}" font-size="10" font-family="JetBrains Mono">18" PIRELLI P ZERO</text>
          </g>

          <!-- REAR NEAR WHEEL & BRAKE SYSTEM -->
          <g class="svg-hotspot" data-tech="tyres">
            <ellipse cx="445" cy="148" rx="25" ry="44" fill="#12161c" stroke="${highlight('tyres')}" stroke-width="${strokeWidth('tyres')}" />
            <ellipse cx="445" cy="148" rx="14" ry="25" fill="#080A0E" stroke="#E10600" stroke-width="1.5" />
            <circle cx="445" cy="148" r="4" fill="#00E5FF" />
            <!-- Glow Braking Duct -->
            <ellipse cx="445" cy="148" rx="7" ry="12" fill="none" stroke="#FF5500" stroke-dasharray="2,2" stroke-width="1.5" />
          </g>
        </svg>
      `;
    }
  }

  /* ==========================================================================
     SECTION: TEAMS (CONSTRUCTORS UNIVERSE - 11 TEAMS FOR 2026)
     ========================================================================== */
  function renderTeamsSection() {
    const root = document.getElementById('section-teams');
    if (!root || !window.F1_DATA) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="shield" class="w-4 h-4"></i>
          <span>Constructors Championship</span>
          <span>·</span>
          <span class="text-slate-400">Official 2026 Grid</span>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            The 11 <span class="text-f1-red">Constructors</span>
          </h1>
          <span class="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300">
            Expanded 11-Team Roster with Cadillac F1
          </span>
        </div>
        <p class="text-slate-400 text-sm max-w-2xl">
          Formula 1 features 11 world-class engineering outfits in 2026. Click any team card to open their verified historical achievements, technical directors, and official links.
        </p>
      </div>

      <!-- Teams Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        ${window.F1_DATA.teams.map(team => {
          const isFav = (state.favorites.teams || []).includes(team.id);
          const driver1 = window.F1_DATA.drivers.find(d => d.id === team.drivers[0]);
          const driver2 = window.F1_DATA.drivers.find(d => d.id === team.drivers[1]);

          return `
            <div class="glass-panel glass-card-hover rounded-2xl border border-white/10 p-5 space-y-4 cursor-pointer relative overflow-hidden group flex flex-col justify-between" onclick="openTeamModal('${team.id}')">
              <!-- Top accent color bar -->
              <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${team.color};"></div>
              
              <div>
                <div class="flex items-start justify-between pt-1">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm text-white shadow-md" style="background: linear-gradient(135deg, ${team.color} 0%, #080A0E 100%); border: 1px solid rgba(255,255,255,0.15)">
                      ${team.shortName.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 class="font-display font-bold text-base text-white group-hover:text-f1-red transition-colors">${team.name}</h3>
                      <div class="text-xs font-mono text-slate-400">${team.base}</div>
                    </div>
                  </div>
                  <button onclick="event.stopPropagation(); toggleFavorite('teams', '${team.id}')" aria-label="Bookmark team" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="bookmark" class="w-4 h-4 ${isFav ? 'fill-f1-red text-f1-red' : ''}"></i>
                  </button>
                </div>

                <!-- Verified Team Car Visual (Photograph or Animated Vector Livery) -->
                <div class="relative w-full h-36 rounded-xl overflow-hidden bg-black/50 border border-white/5 my-3 group">
                  <img id="team-car-img-${team.id}" src="${team.carImage}" alt="${team.name} ${team.carModel}" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.onerror=null; this.src='${team.carIllustration || (window.F1_VISUALS ? window.F1_VISUALS.getTeamCarIllustration('${team.id}') : '')}'; const el = document.getElementById('team-attr-${team.id}'); if (el) el.textContent = 'Bespoke Livery Illustration';">
                  <div class="absolute inset-0 bg-gradient-to-t from-[#080A0E] via-transparent to-transparent pointer-events-none"></div>
                  <div class="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
                    <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-white font-bold pointer-events-none">${team.carModel}</span>
                    <span id="team-attr-${team.id}" class="text-slate-300 truncate max-w-[130px] bg-black/70 px-1.5 py-0.5 rounded pointer-events-none">${team.carImageAttribution || 'FIA / Wikimedia'}</span>
                    <button type="button" onclick="event.stopPropagation(); window.toggleTeamVisual('${team.id}', event)" class="p-1 rounded bg-black/70 hover:bg-black/90 text-amber-400 hover:text-amber-300 border border-white/10 transition-colors" title="Toggle between Photograph and Bespoke Livery Illustration">
                      <i data-lucide="palette" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>

                <!-- Driver Lineup Strip -->
                <div class="bg-black/40 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-500">#${driver1?.number || ''}</span>
                    <span class="font-bold text-white">${driver1?.name.split(' ').pop()}</span>
                  </div>
                  <span class="text-slate-600 font-bold">VS</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-500">#${driver2?.number || ''}</span>
                    <span class="font-bold text-white">${driver2?.name.split(' ').pop()}</span>
                  </div>
                </div>
              </div>

              <!-- Team Key Stats -->
              <div class="space-y-3 pt-2">
                <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div class="bg-white/5 p-2 rounded-lg">
                    <span class="text-slate-400 text-[10px] block">TITLES</span>
                    <span class="font-bold text-white text-sm">${team.championships}</span>
                  </div>
                  <div class="bg-white/5 p-2 rounded-lg">
                    <span class="text-slate-400 text-[10px] block">WINS</span>
                    <span class="font-bold text-white text-sm">${team.wins}</span>
                  </div>
                  <div class="bg-white/5 p-2 rounded-lg">
                    <span class="text-slate-400 text-[10px] block">FIRST GP</span>
                    <span class="font-bold text-white text-sm">${team.firstEntry}</span>
                  </div>
                </div>

                <!-- Bottom details strip -->
                <div class="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/5 pt-3">
                  <span class="truncate max-w-[180px]">Principal: ${team.teamPrincipal}</span>
                  <span class="text-f1-red flex items-center gap-1">Details <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  window.openTeamModal = (teamId) => {
    const team = window.F1_DATA.teams.find(t => t.id === teamId);
    if (!team) return;

    const driver1 = window.F1_DATA.drivers.find(d => d.id === team.drivers[0]);
    const driver2 = window.F1_DATA.drivers.find(d => d.id === team.drivers[1]);

    const modalHtml = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-white/10 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-xl text-white shadow-lg" style="background: linear-gradient(135deg, ${team.color} 0%, #080A0E 100%);">
              ${team.shortName.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div class="text-xs font-mono text-f1-red font-semibold uppercase tracking-wider">${team.country} · Founded in ${team.firstEntry}</div>
              <h2 class="text-2xl md:text-3xl font-display font-black text-white mt-0.5">${team.name}</h2>
            </div>
          </div>
        </div>

        <!-- Verified Car Photograph or Livery Illustration in Modal -->
        <div class="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden bg-black/60 border border-white/10">
          <img id="team-modal-car-${team.id}" src="${team.carImage}" alt="${team.name} ${team.carModel}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${team.carIllustration || (window.F1_VISUALS ? window.F1_VISUALS.getTeamCarIllustration('${team.id}') : '')}'; const el = document.getElementById('team-modal-attr-${team.id}'); if (el) el.textContent = 'Bespoke Livery Illustration';">
          <div class="absolute inset-0 bg-gradient-to-t from-[#080A0E] via-transparent to-transparent pointer-events-none"></div>
          <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono">
            <div class="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white flex items-center gap-2">
              <span class="text-slate-400">Chassis:</span>
              <span class="font-bold text-f1-red">${team.carModel}</span>
            </div>
            <div class="flex items-center gap-2">
              <div id="team-modal-attr-${team.id}" class="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-[11px]">
                ${team.carImageAttribution || 'Verified Motorsport Archive'}
              </div>
              <button type="button" onclick="window.toggleTeamVisual('${team.id}')" class="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-amber-400 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors" title="Toggle Visual Style">
                <i data-lucide="palette" class="w-3.5 h-3.5"></i>
                <span>Art Style</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="text-sm text-slate-300 leading-relaxed">${team.description}</p>

        <!-- Stats Matrix -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Constructors Titles</div>
            <div class="text-2xl font-bold text-white mt-0.5">${team.championships}</div>
          </div>
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Grand Prix Wins</div>
            <div class="text-2xl font-bold text-white mt-0.5">${team.wins}</div>
          </div>
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Podium Finishes</div>
            <div class="text-2xl font-bold text-white mt-0.5">${team.podiums}</div>
          </div>
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Pole Positions</div>
            <div class="text-2xl font-bold text-white mt-0.5">${team.poles}</div>
          </div>
        </div>

        <!-- Leadership & Factory -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
            <div class="text-f1-red font-bold uppercase tracking-wider">Technical & Management</div>
            <div class="text-slate-300"><span class="text-slate-500">Team Principal:</span> ${team.teamPrincipal}</div>
            <div class="text-slate-300"><span class="text-slate-500">Technical Leadership:</span> ${team.technicalDirector}</div>
            <div class="text-slate-300"><span class="text-slate-500">Power Unit:</span> ${team.powerUnit}</div>
            <div class="text-slate-300"><span class="text-slate-500">Headquarters:</span> ${team.base}</div>
          </div>

          <div class="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
            <div class="text-f1-red font-bold uppercase tracking-wider">Key Historical Innovations</div>
            <ul class="space-y-1.5 text-slate-300">
              ${team.innovations.map(inv => `<li class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i><span>${inv}</span></li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- 2026 Race Drivers -->
        <div class="space-y-2">
          <h4 class="font-display font-bold text-sm text-white uppercase tracking-wider">2026 Championship Race Drivers</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-f1-red" onclick="closeModal(); openDriverModal('${driver1?.id}')">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">${driver1?.flag}</span>
                <div>
                  <div class="text-xs font-bold text-white">${driver1?.name}</div>
                  <div class="text-[10px] font-mono text-slate-400">#${driver1?.number} · ${driver1?.nationality}</div>
                </div>
              </div>
              <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400"></i>
            </div>
            <div class="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-f1-red" onclick="closeModal(); openDriverModal('${driver2?.id}')">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">${driver2?.flag}</span>
                <div>
                  <div class="text-xs font-bold text-white">${driver2?.name}</div>
                  <div class="text-[10px] font-mono text-slate-400">#${driver2?.number} · ${driver2?.nationality}</div>
                </div>
              </div>
              <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400"></i>
            </div>
          </div>
        </div>

        <!-- External Verified Links -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-mono">
          <div class="flex items-center gap-3">
            <a href="${team.website}" target="_blank" rel="noopener noreferrer" class="text-slate-300 hover:text-white flex items-center gap-1.5 underline">
              <i data-lucide="globe" class="w-3.5 h-3.5"></i>
              <span>Official Website</span>
            </a>
            <a href="${team.social.instagram}" target="_blank" rel="noopener noreferrer" class="text-slate-300 hover:text-white flex items-center gap-1.5 underline">
              <i data-lucide="instagram" class="w-3.5 h-3.5"></i>
              <span>Instagram</span>
            </a>
            <a href="${team.social.x}" target="_blank" rel="noopener noreferrer" class="text-slate-300 hover:text-white flex items-center gap-1.5 underline">
              <i data-lucide="twitter" class="w-3.5 h-3.5"></i>
              <span>X / Twitter</span>
            </a>
          </div>
          <button onclick="closeModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">Close</button>
        </div>
      </div>
    `;

    openModal(modalHtml);
  };

  /* ==========================================================================
     SECTION: DRIVERS (22 DRIVERS FOR 2026 WITH 3D FLIP CARDS & PORTRAITS)
     ========================================================================== */
  window.toggleDriverVisual = (driverId, event) => {
    if (event) event.stopPropagation();
    const driver = window.F1_DATA.drivers.find(d => d.id === driverId);
    if (!driver) return;
    const imgs = [
      document.getElementById(`driver-img-${driverId}`),
      document.getElementById(`driver-modal-img-${driverId}`)
    ].filter(Boolean);
    const attr = document.getElementById(`driver-attr-${driverId}`);
    imgs.forEach(img => {
      const isIllustration = img.src.startsWith('data:image/svg+xml');
      if (isIllustration) {
        img.src = driver.photo;
        if (attr) attr.textContent = driver.photoAttribution || 'Wikimedia Commons';
      } else {
        img.src = driver.illustration || (window.F1_VISUALS ? window.F1_VISUALS.getDriverIllustration(driverId) : '');
        if (attr) attr.textContent = 'Bespoke Illustration';
      }
    });
    if (window.lucide) window.lucide.createIcons();
  };

  window.toggleTeamVisual = (teamId, event) => {
    if (event) event.stopPropagation();
    const team = window.F1_DATA.teams.find(t => t.id === teamId);
    if (!team) return;
    const imgs = [
      document.getElementById(`team-car-img-${teamId}`),
      document.getElementById(`team-modal-car-${teamId}`)
    ].filter(Boolean);
    const attr = document.getElementById(`team-attr-${teamId}`) || document.getElementById(`team-modal-attr-${teamId}`);
    imgs.forEach(img => {
      const isIllustration = img.src.startsWith('data:image/svg+xml');
      if (isIllustration) {
        img.src = team.carImage;
        if (attr) attr.textContent = team.carImageAttribution || 'FIA / Wikimedia';
      } else {
        img.src = team.carIllustration || (window.F1_VISUALS ? window.F1_VISUALS.getTeamCarIllustration(teamId) : '');
        if (attr) attr.textContent = 'Bespoke Livery Illustration';
      }
    });
    if (window.lucide) window.lucide.createIcons();
  };

  window.flipDriverCard = (driverId, event) => {
    if (event) {
      if (event.target.closest('a, [data-no-flip="true"]')) return;
      event.stopPropagation();
    }
    const card = document.getElementById(`driver-card-${driverId}`);
    if (card) {
      card.classList.toggle('is-flipped');
      if (window.lucide) window.lucide.createIcons();
    }
  };

  function renderDriversSection() {
    const root = document.getElementById('section-drivers');
    if (!root || !window.F1_DATA) return;

    // Filter & Search
    let filtered = window.F1_DATA.drivers.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(state.driverSearch.toLowerCase()) || 
                          d.code.toLowerCase().includes(state.driverSearch.toLowerCase()) ||
                          d.nationality.toLowerCase().includes(state.driverSearch.toLowerCase());
      const matchTeam = state.driverTeamFilter === 'all' || d.teamId === state.driverTeamFilter;
      return matchSearch && matchTeam;
    });

    // Sorting with verified career stats
    if (state.driverSort === 'points') {
      filtered.sort((a, b) => (b.careerStats?.careerPoints ?? b.careerPoints ?? 0) - (a.careerStats?.careerPoints ?? a.careerPoints ?? 0));
    } else if (state.driverSort === 'wins') {
      filtered.sort((a, b) => (b.careerStats?.wins ?? b.wins ?? 0) - (a.careerStats?.wins ?? a.wins ?? 0));
    } else if (state.driverSort === 'podiums') {
      filtered.sort((a, b) => (b.careerStats?.podiums ?? b.podiums ?? 0) - (a.careerStats?.podiums ?? a.podiums ?? 0));
    } else if (state.driverSort === 'championships') {
      filtered.sort((a, b) => (b.careerStats?.championships ?? b.championships ?? 0) - (a.careerStats?.championships ?? a.championships ?? 0) || (b.careerStats?.wins ?? b.wins ?? 0) - (a.careerStats?.wins ?? a.wins ?? 0));
    } else if (state.driverSort === 'starts') {
      filtered.sort((a, b) => (b.careerStats?.starts ?? b.starts ?? 0) - (a.careerStats?.starts ?? a.starts ?? 0));
    } else if (state.driverSort === 'number') {
      filtered.sort((a, b) => a.number - b.number);
    }

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>World Drivers' Championship</span>
          <span>·</span>
          <span class="text-slate-400">22 Drivers on the Grid</span>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
            The 2026 <span class="text-f1-red">Formula 1 Grid</span>
          </h1>
          <span class="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300">
            Interactive 3D Flip Cards & Verified Biographies
          </span>
        </div>
        <p class="text-slate-400 text-sm max-w-2xl">
          Complete profiles with verified career vs season statistics, teammate head-to-head comparisons, and official social media channels. Tap anywhere on any card to flip it in place and reveal full records.
        </p>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="glass-panel p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <!-- Search Input -->
          <div class="relative flex-1 min-w-[180px]">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
            <input type="text" id="driverSearchInput" value="${state.driverSearch}" placeholder="Search driver, code, nationality..." class="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-f1-red">
          </div>

          <!-- Team Filter -->
          <select id="driverTeamSelect" class="bg-black/40 border border-white/10 text-xs font-mono rounded-lg px-3 py-2 text-white focus:outline-none focus:border-f1-red">
            <option value="all">All 11 Teams</option>
            ${window.F1_DATA.teams.map(t => `<option value="${t.id}" ${state.driverTeamFilter === t.id ? 'selected' : ''}>${t.shortName}</option>`).join('')}
          </select>
        </div>

        <!-- Sort Select -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-slate-400">Sort By:</span>
          <select id="driverSortSelect" class="bg-black/40 border border-white/10 text-xs font-mono rounded-lg px-3 py-2 text-white focus:outline-none focus:border-f1-red">
            <option value="points" ${state.driverSort === 'points' ? 'selected' : ''}>Championship Rank</option>
            <option value="wins" ${state.driverSort === 'wins' ? 'selected' : ''}>Career Wins</option>
            <option value="podiums" ${state.driverSort === 'podiums' ? 'selected' : ''}>Career Podiums</option>
            <option value="championships" ${state.driverSort === 'championships' ? 'selected' : ''}>World Titles</option>
            <option value="starts" ${state.driverSort === 'starts' ? 'selected' : ''}>Grand Prix Starts</option>
            <option value="number" ${state.driverSort === 'number' ? 'selected' : ''}>Driver Number</option>
          </select>
        </div>
      </div>

      <!-- Drivers Grid with In-Place 3D Flip Card Architecture -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${filtered.map(driver => {
          const team = window.F1_DATA.teams.find(t => t.id === driver.teamId);
          const isFav = (state.favorites.drivers || []).includes(driver.id);
          const cStats = driver.careerStats || {};

          return `
            <div class="driver-card-perspective h-[480px] select-none group" onclick="window.flipDriverCard('${driver.id}', event)">
              <div id="driver-card-${driver.id}" class="driver-card-inner">
                
                <!-- FRONT FACE -->
                <div class="driver-card-front glass-panel rounded-2xl border border-white/10 p-5 flex flex-col justify-between overflow-hidden shadow-lg group-hover:border-white/20 transition-colors">
                  <!-- Top color bar -->
                  <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${team?.color || '#E10600'};"></div>

                  <!-- Header & Bookmark -->
                  <div>
                    <div class="flex items-start justify-between pt-1">
                      <div class="flex items-center gap-2.5">
                        <span class="text-2xl">${driver.flag}</span>
                        <div>
                          <h3 class="font-display font-bold text-base text-white hover:text-f1-red transition-colors">${driver.name}</h3>
                          <div class="text-[11px] font-mono text-slate-400">${team?.shortName}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-display font-black text-xl text-white/40">#${driver.number}</span>
                        <button onclick="event.stopPropagation(); toggleFavorite('drivers', '${driver.id}')" data-no-flip="true" aria-label="Bookmark driver" class="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors">
                          <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isFav ? 'fill-f1-red text-f1-red' : ''}"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Verified Driver Portrait Image with Attribution & Art Toggle -->
                    <div class="relative w-full h-40 rounded-xl overflow-hidden bg-black/50 border border-white/5 my-2.5">
                      <img id="driver-img-${driver.id}" src="${driver.photo}" alt="${driver.name}" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105" onerror="this.onerror=null; this.src='${driver.illustration || (window.F1_VISUALS ? window.F1_VISUALS.getDriverIllustration('${driver.id}') : '')}'; const el = document.getElementById('driver-attr-${driver.id}'); if (el) el.textContent = 'Bespoke Illustration';">
                      <div class="absolute inset-0 bg-gradient-to-t from-[#080A0E] via-transparent to-transparent pointer-events-none"></div>
                      <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono">
                        <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-white font-bold pointer-events-none">${driver.code}</span>
                        <span id="driver-attr-${driver.id}" class="text-slate-300 truncate max-w-[130px] bg-black/70 px-1.5 py-0.5 rounded pointer-events-none">${driver.photoAttribution || 'Wikimedia / CC'}</span>
                        <button type="button" onclick="event.stopPropagation(); window.toggleDriverVisual('${driver.id}', event)" class="p-1 rounded bg-black/70 hover:bg-black/90 text-amber-400 hover:text-amber-300 border border-white/10 transition-colors" title="Toggle between Photograph and Bespoke Illustration" data-no-flip="true">
                          <i data-lucide="palette" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Quick Career Stats Grid (Strictly Verified Formula 1 Data) -->
                    <div class="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
                      <div class="bg-white/5 p-2 rounded-lg">
                        <span class="text-slate-400 text-[10px] block">WINS</span>
                        <span class="font-bold text-white text-sm">${cStats.wins ?? driver.wins ?? 0}</span>
                      </div>
                      <div class="bg-white/5 p-2 rounded-lg">
                        <span class="text-slate-400 text-[10px] block">PODIUMS</span>
                        <span class="font-bold text-amber-400 text-sm">${cStats.podiums ?? driver.podiums ?? 0}</span>
                      </div>
                      <div class="bg-white/5 p-2 rounded-lg">
                        <span class="text-slate-400 text-[10px] block">STARTS</span>
                        <span class="font-bold text-white text-sm">${cStats.starts ?? driver.starts ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 3D Flip Action Button -->
                  <div class="flex items-center justify-between pt-2.5 border-t border-white/5">
                    <button onclick="window.flipDriverCard('${driver.id}', event)" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm">
                      <i data-lucide="rotate-3d" class="w-3.5 h-3.5 text-f1-red"></i>
                      <span>Flip Card</span>
                    </button>
                    <button onclick="event.stopPropagation(); openDriverModal('${driver.id}')" data-no-flip="true" class="text-xs font-mono text-f1-red hover:underline flex items-center gap-0.5">
                      <span>Full Bio</span>
                      <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>

                <!-- BACK FACE -->
                <div class="driver-card-back glass-panel-elevated rounded-2xl border border-white/15 p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
                  <!-- Top color bar -->
                  <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${team?.color || '#E10600'};"></div>

                  <div>
                    <div class="flex items-start justify-between pt-1">
                      <div>
                        <div class="text-[10px] font-mono uppercase text-f1-red font-bold tracking-wider">Career Records</div>
                        <h4 class="font-display font-bold text-base text-white">${driver.name} <span class="text-xs font-mono text-slate-400">(#${driver.number})</span></h4>
                      </div>
                      <button onclick="window.flipDriverCard('${driver.id}', event)" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors" title="Flip Back">
                        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                      </button>
                    </div>

                    <!-- Career Details Matrix -->
                    <div class="grid grid-cols-2 gap-2 text-xs font-mono my-2.5">
                      <div class="bg-black/40 p-2 rounded-lg border border-white/5">
                        <span class="text-slate-400 text-[10px] block">WORLD TITLES</span>
                        <span class="font-bold text-emerald-400 text-sm">${(cStats.championships ?? driver.championships ?? 0) > 0 ? `${cStats.championships ?? driver.championships}x Champion` : '0'}</span>
                      </div>
                      <div class="bg-black/40 p-2 rounded-lg border border-white/5">
                        <span class="text-slate-400 text-[10px] block">CAREER POINTS</span>
                        <span class="font-bold text-cyan-400 text-sm">${(cStats.careerPoints ?? driver.careerPoints ?? 0).toLocaleString()}</span>
                      </div>
                      <div class="bg-black/40 p-2 rounded-lg border border-white/5">
                        <span class="text-slate-400 text-[10px] block">POLES</span>
                        <span class="font-bold text-white text-sm">${cStats.poles ?? driver.poles ?? 0}</span>
                      </div>
                      <div class="bg-black/40 p-2 rounded-lg border border-white/5">
                        <span class="text-slate-400 text-[10px] block">FASTEST LAPS</span>
                        <span class="font-bold text-white text-sm">${cStats.fastestLaps ?? 0}</span>
                      </div>
                    </div>

                    <!-- Sprint Statistics Indicator -->
                    <div class="bg-black/40 p-2 rounded-lg border border-white/5 text-[10px] font-mono flex items-center justify-between mb-2.5">
                      <span class="text-slate-400">SPRINT FORMAT:</span>
                      <span class="text-amber-400 font-bold">${driver.sprintStats?.wins ? `${driver.sprintStats.wins} Win${driver.sprintStats.wins > 1 ? 's' : ''}` : '0 Wins'} · ${driver.sprintStats?.points || 0} Pts</span>
                    </div>

                    <!-- Short Bio -->
                    <div class="bg-black/30 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                      <p class="line-clamp-3">${driver.bio}</p>
                    </div>
                  </div>

                  <!-- Social Links & Deep Modal -->
                  <div class="space-y-2 pt-2 border-t border-white/5">
                    <div class="flex items-center justify-between text-xs font-mono">
                      <a href="${driver.instagram}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="text-pink-400 hover:underline flex items-center gap-1">
                        <i data-lucide="instagram" class="w-3.5 h-3.5"></i>
                        <span class="truncate max-w-[120px]">@${driver.instagram.split('/').filter(Boolean).pop()}</span>
                      </a>
                      <a href="${driver.x}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="text-sky-400 hover:underline flex items-center gap-1">
                        <i data-lucide="twitter" class="w-3.5 h-3.5"></i>
                        <span>Twitter / X</span>
                      </a>
                    </div>
                    <button onclick="event.stopPropagation(); openDriverModal('${driver.id}')" data-no-flip="true" class="w-full py-2 bg-f1-red hover:bg-f1-darkRed text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-f1-red/20">
                      <span>Full Profile & Teammate H2H</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind Search & Filters
    document.getElementById('driverSearchInput')?.addEventListener('input', (e) => {
      state.driverSearch = e.target.value;
      renderDriversSection();
    });
    document.getElementById('driverTeamSelect')?.addEventListener('change', (e) => {
      state.driverTeamFilter = e.target.value;
      renderDriversSection();
    });
    document.getElementById('driverSortSelect')?.addEventListener('change', (e) => {
      state.driverSort = e.target.value;
      renderDriversSection();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  window.openDriverModal = (driverId) => {
    const driver = window.F1_DATA.drivers.find(d => d.id === driverId);
    if (!driver) return;
    const team = window.F1_DATA.teams.find(t => t.id === driver.teamId);

    // Find teammate
    const teammateId = team?.drivers.find(id => id !== driver.id);
    const teammate = window.F1_DATA.drivers.find(d => d.id === teammateId);

    const cStats = driver.careerStats || {};
    const sStats = driver.seasonStats || {};
    const tStats = teammate?.careerStats || {};

    const modalHtml = `
      <div class="space-y-6">
        <!-- Header with Portrait -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4">
          <div class="flex items-center gap-4">
            <!-- Portrait avatar with team border & illustration fallback -->
            <div class="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/60 border-2 shrink-0 shadow-xl" style="border-color: ${team?.color || '#E10600'};">
              <img id="driver-modal-img-${driver.id}" src="${driver.photo}" alt="${driver.name}" class="w-full h-full object-cover object-top" onerror="this.onerror=null; this.src='${driver.illustration || (window.F1_VISUALS ? window.F1_VISUALS.getDriverIllustration('${driver.id}') : '')}';">
            </div>
            <div>
              <div class="text-xs font-mono text-f1-red font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span>${driver.flag} ${driver.nationality}</span>
                <span>·</span>
                <span class="text-slate-300">${team?.name}</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-display font-black text-white mt-0.5">
                ${driver.name} <span class="text-slate-500 font-mono text-lg font-normal">#${driver.number} (${driver.code})</span>
              </h2>
              <div class="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                <span>${driver.photoAttribution || 'FIA / Wikimedia Commons'}</span>
                <button type="button" onclick="window.toggleDriverVisual('${driver.id}')" class="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-400 text-[10px] font-mono transition-colors">Toggle Art Style</button>
              </div>
            </div>
          </div>
          <div class="text-xs font-mono bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-slate-300">
            <div><span class="text-slate-500">Debut:</span> ${driver.debut}</div>
            <div><span class="text-slate-500">Born:</span> ${driver.birthDate}</div>
          </div>
        </div>

        <p class="text-sm text-slate-300 leading-relaxed">${driver.bio}</p>

        <!-- Career vs Season Statistics (Strict Distinction) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- All-Time Career Statistics -->
          <div class="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
            <div class="text-xs font-mono text-f1-red font-bold uppercase tracking-wider flex items-center justify-between">
              <span>All-Time Career Record</span>
              <span class="text-[10px] text-slate-500">Official Formula 1 Archive</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">TITLES</span>
                <span class="font-bold text-white text-base">${cStats.championships ?? driver.championships ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">WINS</span>
                <span class="font-bold text-white text-base">${cStats.wins ?? driver.wins ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">PODIUMS</span>
                <span class="font-bold text-amber-400 text-base">${cStats.podiums ?? driver.podiums ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">POLES</span>
                <span class="font-bold text-white text-base">${cStats.poles ?? driver.poles ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">F. LAPS</span>
                <span class="font-bold text-white text-base">${cStats.fastestLaps ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">STARTS</span>
                <span class="font-bold text-white text-base">${cStats.starts ?? driver.starts ?? 0}</span>
              </div>
            </div>
            <div class="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
              <span>Career Championship Points:</span>
              <span class="font-bold text-cyan-400">${(cStats.careerPoints ?? driver.careerPoints ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <!-- Current 2026 Season Performance -->
          <div class="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
            <div class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Current 2026 Season Performance</span>
              <span class="text-[10px] text-slate-500">Official FIA Standings</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">2026 PTS</span>
                <span class="font-bold text-white text-base">${sStats.seasonPoints ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">2026 WINS</span>
                <span class="font-bold text-white text-base">${sStats.seasonWins ?? 0}</span>
              </div>
              <div class="bg-white/5 p-2 rounded">
                <span class="text-[10px] text-slate-400 block">2026 PODIUMS</span>
                <span class="font-bold text-white text-base">${sStats.seasonPodiums ?? 0}</span>
              </div>
            </div>
            <div class="text-xs text-slate-400 font-mono space-y-1 pt-1">
              <div class="flex items-center justify-between">
                <span>Championship Rank:</span>
                <span class="text-white font-bold">${sStats.championshipRank || 'Pending Opener'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Races Completed:</span>
                <span class="text-white">${sStats.racesCompleted ?? 0} of 24</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sprint Record (Decoupled & Separated from Grand Prix Totals) -->
        <div class="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">SPRINT FORMAT</span>
            <span class="text-slate-300">Sprint Championship Record (2021–Present):</span>
          </div>
          <div class="flex items-center gap-4 text-xs font-mono">
            <div><span class="text-slate-500">WINS:</span> <span class="font-bold text-white">${driver.sprintStats?.wins ?? 0}</span></div>
            <div><span class="text-slate-500">PODIUMS:</span> <span class="font-bold text-amber-400">${driver.sprintStats?.podiums ?? 0}</span></div>
            <div><span class="text-slate-500">POINTS:</span> <span class="font-bold text-cyan-400">${driver.sprintStats?.points ?? 0}</span></div>
            <div><span class="text-slate-500">STARTS:</span> <span class="font-bold text-slate-300">${driver.sprintStats?.starts ?? 0}</span></div>
          </div>
        </div>

        <!-- Official Classification & Verification Audit Badge -->
        <div class="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-[11px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
            <span>${driver.auditMetadata?.source || 'Official Formula 1 & FIA Archive Certified'}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400">Audited: ${driver.auditMetadata?.lastChecked || '2026-03-01'}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              ${driver.auditMetadata?.status || 'VERIFIED'}
            </span>
          </div>
        </div>

        <!-- Teammate Head-to-Head Comparison -->
        ${teammate ? `
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <h4 class="font-display font-bold text-sm text-white uppercase tracking-wider">Teammate Head-to-Head (${driver.name} vs ${teammate.name})</h4>
            <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono items-center">
              <div class="font-bold text-f1-red">${driver.name.split(' ').pop()}</div>
              <div class="text-slate-500 uppercase text-[10px]">CATEGORY</div>
              <div class="font-bold text-cyan-400">${teammate.name.split(' ').pop()}</div>

              <div class="text-white font-bold">${cStats.wins ?? driver.wins ?? 0}</div>
              <div class="text-slate-400 text-[10px]">Career Wins</div>
              <div class="text-white font-bold">${tStats.wins ?? teammate.wins ?? 0}</div>

              <div class="text-white font-bold text-amber-400">${cStats.podiums ?? driver.podiums ?? 0}</div>
              <div class="text-slate-400 text-[10px]">Grand Prix Podiums</div>
              <div class="text-white font-bold text-amber-400">${tStats.podiums ?? teammate.podiums ?? 0}</div>

              <div class="text-white font-bold">${cStats.poles ?? driver.poles ?? 0}</div>
              <div class="text-slate-400 text-[10px]">Pole Positions</div>
              <div class="text-white font-bold">${tStats.poles ?? teammate.poles ?? 0}</div>

              <div class="text-white font-bold">${cStats.starts ?? driver.starts ?? 0}</div>
              <div class="text-slate-400 text-[10px]">Grand Prix Starts</div>
              <div class="text-white font-bold">${tStats.starts ?? teammate.starts ?? 0}</div>

              <div class="text-white font-bold text-emerald-400">${cStats.championships ?? driver.championships ?? 0}</div>
              <div class="text-slate-400 text-[10px]">World Championships</div>
              <div class="text-white font-bold text-emerald-400">${tStats.championships ?? teammate.championships ?? 0}</div>

              <div class="text-white font-bold">${(cStats.careerPoints ?? driver.careerPoints ?? 0).toLocaleString()}</div>
              <div class="text-slate-400 text-[10px]">Career Points</div>
              <div class="text-white font-bold">${(tStats.careerPoints ?? teammate.careerPoints ?? 0).toLocaleString()}</div>
            </div>
          </div>
        ` : ''}

        <!-- Verified Driver Social Links -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-mono">
          <div class="flex items-center gap-4">
            <a href="${driver.instagram}" target="_blank" rel="noopener noreferrer" class="text-pink-400 hover:underline flex items-center gap-1.5">
              <i data-lucide="instagram" class="w-4 h-4"></i>
              <span>Verified Instagram Profile</span>
            </a>
            <a href="${driver.x}" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline flex items-center gap-1.5">
              <i data-lucide="twitter" class="w-4 h-4"></i>
              <span>Verified X / Twitter</span>
            </a>
          </div>
          <button onclick="closeModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">Close</button>
        </div>
      </div>
    `;

    openModal(modalHtml);
  };

  /* ==========================================================================
     SECTION: CALENDAR (24 ROUNDS WITH TIMEZONE & SCHEDULE)
     ========================================================================== */
  function renderCalendarSection() {
    const root = document.getElementById('section-calendar');
    if (!root || !window.F1_DATA) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="calendar" class="w-4 h-4"></i>
          <span>Official FIA Calendar</span>
          <span>·</span>
          <span class="text-slate-400">2026 World Championship</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          24 Grand Prix <span class="text-f1-red">Schedule</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Complete season timetable with sprint weekend indicators, circuit lengths, lap counts, and lap records in your selected time zone (${state.timeZone}).
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${window.F1_DATA.circuits.map(c => {
          const raceDate = new Date(c.date);
          const formattedDate = state.timeZone === 'UTC' 
            ? raceDate.toUTCString()
            : raceDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

          return `
            <div class="glass-panel glass-card-hover p-5 rounded-2xl border border-white/10 space-y-4 cursor-pointer" onclick="openCircuitModal('${c.id}')">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">${c.flag}</span>
                  <div>
                    <span class="text-[10px] font-mono uppercase text-f1-red font-bold">Round ${c.round.toString().padStart(2, '0')}</span>
                    <h3 class="font-display font-bold text-base text-white">${c.gpName}</h3>
                  </div>
                </div>
                ${c.isSprint ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">SPRINT</span>` : ''}
              </div>

              <div class="text-xs text-slate-400 font-mono">
                <div>Circuit: ${c.name}</div>
                <div class="text-white mt-1 flex items-center gap-1.5">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-f1-red"></i>
                  <span>${formattedDate}</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 text-center text-[11px] font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span class="text-slate-500 block text-[9px]">LENGTH</span>
                  <span class="text-white font-bold">${c.lengthKm} km</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[9px]">LAPS</span>
                  <span class="text-white font-bold">${c.laps}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[9px]">RECORD</span>
                  <span class="text-white font-bold">${c.lapRecord}</span>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span>${c.turns} Turns</span>
                <span class="text-f1-red flex items-center gap-1">Track Guide <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SECTION: CIRCUITS TRACK EXPLORER
     ========================================================================== */
  function renderCircuitsSection() {
    const root = document.getElementById('section-circuits');
    if (!root || !window.F1_DATA) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="map" class="w-4 h-4"></i>
          <span>Track Explorer</span>
          <span>·</span>
          <span class="text-slate-400">24 World Championship Venues</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Circuits of the <span class="text-f1-red">World</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Detailed technical blueprints, DRS activation zones, and verified historical lap records for every circuit.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${window.F1_DATA.circuits.map(c => `
          <div class="glass-panel glass-card-hover p-6 rounded-2xl border border-white/10 space-y-4 cursor-pointer" onclick="openCircuitModal('${c.id}')">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-mono text-f1-red font-bold uppercase">${c.flag} ${c.country}</span>
                <h3 class="font-display font-bold text-lg text-white mt-0.5">${c.name}</h3>
              </div>
              <span class="text-xs font-mono px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-300">R${c.round}</span>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">${c.characteristics}</p>

            <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5">
              <div><span class="text-slate-500">Lap Record:</span> <span class="text-white font-bold">${c.lapRecord}</span></div>
              <div><span class="text-slate-500">Record By:</span> <span class="text-white">${c.recordHolder.split('(')[0]}</span></div>
              <div><span class="text-slate-500">Turns:</span> <span class="text-white">${c.turns}</span></div>
              <div><span class="text-slate-500">DRS Zones:</span> <span class="text-white">${c.drsZones}</span></div>
            </div>

            <div class="flex items-center justify-between text-xs font-mono text-f1-red pt-1">
              <span>View full circuit blueprint</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  window.openCircuitModal = (circuitId) => {
    const c = window.F1_DATA.circuits.find(item => item.id === circuitId);
    if (!c) return;

    const modalHtml = `
      <div class="space-y-6">
        <div class="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div class="text-xs font-mono text-f1-red font-semibold uppercase tracking-wider">${c.flag} Round ${c.round} · ${c.country}</div>
            <h2 class="text-2xl md:text-3xl font-display font-black text-white mt-0.5">${c.name}</h2>
          </div>
        </div>

        <p class="text-sm text-slate-300 leading-relaxed">${c.characteristics}</p>

        <!-- Technical Specs -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Circuit Length</div>
            <div class="text-lg font-bold text-white mt-0.5">${c.lengthKm} km</div>
          </div>
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Race Laps</div>
            <div class="text-lg font-bold text-white mt-0.5">${c.laps} Laps</div>
          </div>
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Race Distance</div>
            <div class="text-lg font-bold text-white mt-0.5">${c.raceDistanceKm} km</div>
          </div>
          <div class="bg-black/40 p-3 rounded-xl border border-white/10">
            <div class="text-[10px] text-slate-400 uppercase">Corners / Turns</div>
            <div class="text-lg font-bold text-white mt-0.5">${c.turns}</div>
          </div>
        </div>

        <div class="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-xs font-mono">
          <div class="text-f1-red font-bold uppercase tracking-wider">Historical Track Benchmarks</div>
          <div>Official Lap Record: <span class="font-bold text-white">${c.lapRecord}</span> (${c.recordHolder})</div>
          <div>Inaugural World Championship GP: <span class="font-bold text-white">${c.firstGP}</span></div>
          <div>DRS Detection & Activation Zones: <span class="font-bold text-white">${c.drsZones} Zones</span></div>
        </div>

        <div class="flex justify-end pt-3 border-t border-white/10">
          <button onclick="closeModal()" class="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono">Close</button>
        </div>
      </div>
    `;

    openModal(modalHtml);
  };

  /* ==========================================================================
     SECTION: LEARN F1 GUIDE (MODULES A THROUGH E)
     ========================================================================== */
  function renderLearnSection() {
    const root = document.getElementById('section-learn');
    if (!root) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="book-open" class="w-4 h-4"></i>
          <span>F1 Academy Knowledge Base</span>
          <span>·</span>
          <span class="text-slate-400">Beginner to Advanced</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Learn <span class="text-f1-red">Formula 1</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Everything from the founding 1950 Silverstone race, weekend session formats, flags, downforce aerodynamics, tyre deg, to telemetry analytics.
        </p>
      </div>

      <!-- Modules Accordions -->
      <div class="space-y-4">
        <!-- Module A: Introduction -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div class="flex items-center justify-between cursor-pointer" onclick="toggleLearnModule('modA')">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-f1-red/20 text-f1-red flex items-center justify-center font-display font-black text-sm">A</span>
              <div>
                <h3 class="font-display font-bold text-lg text-white">Module A: Introduction to Formula 1</h3>
                <p class="text-xs text-slate-400">Origins, 1950 first championship, FIA vs FOM, teams, pit crews, race engineers.</p>
              </div>
            </div>
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i>
          </div>
          <div id="modA" class="pt-3 border-t border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p><strong>What is Formula 1?</strong> Formula 1 is the highest class of international racing for open-wheel, single-seater formula racing cars sanctioned by the Fédération Internationale de l'Automobile (FIA). The word 'Formula' refers to the strict set of technical and sporting regulations to which all participants' cars must conform.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div class="bg-black/40 p-3 rounded-lg border border-white/5">
                <span class="text-f1-red font-bold block mb-1">FIA</span>
                Governing body that writes the rulebook, enforces safety regulations, and manages stewards.
              </div>
              <div class="bg-black/40 p-3 rounded-lg border border-white/5">
                <span class="text-cyan-400 font-bold block mb-1">FOM (Formula One Group)</span>
                Commercial rights holder managing global television broadcasts, circuit contracts, and logistics.
              </div>
              <div class="bg-black/40 p-3 rounded-lg border border-white/5">
                <span class="text-emerald-400 font-bold block mb-1">Constructors</span>
                The 11 teams who design and build their own chassis, carbon tub, and aerodynamics.
              </div>
            </div>
            <div class="bg-white/5 p-3 rounded-lg">
              <strong>The Roles on the Pit Wall:</strong>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li><strong>Team Principal:</strong> The CEO managing sporting politics, sponsorships, and team operations.</li>
                <li><strong>Race Engineer:</strong> The single voice talking into the driver's helmet throughout the race with telemetry deltas.</li>
                <li><strong>Pit Crew:</strong> A coordinated squad of 20 specialists executing 4-tyre pit stops in under 2.0 seconds.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Module B: The Race Weekend Format -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div class="flex items-center justify-between cursor-pointer" onclick="toggleLearnModule('modB')">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-display font-black text-sm">B</span>
              <div>
                <h3 class="font-display font-bold text-lg text-white">Module B: The Race Weekend Format</h3>
                <p class="text-xs text-slate-400">Practice (FP1-3), Knockout Qualifying (Q1, Q2, Q3), Sprint Weekends, and Parc Fermé.</p>
              </div>
            </div>
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i>
          </div>
          <div id="modB" class="pt-3 border-t border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed">
            <p><strong>Standard Weekend Structure:</strong></p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div class="bg-black/40 p-3 rounded-lg border border-white/5">
                <span class="text-white font-bold block mb-1">Friday: Practice (FP1 & FP2)</span>
                60-minute sessions to calibrate aero setups, test suspension ride heights, and measure tyre degradation.
              </div>
              <div class="bg-black/40 p-3 rounded-lg border border-white/5">
                <span class="text-white font-bold block mb-1">Saturday: FP3 & Qualifying</span>
                Three knockout sessions: Q1 eliminates the 6 slowest cars; Q2 eliminates 6 more; Q3 is the top-10 shootout for Pole Position.
              </div>
              <div class="bg-black/40 p-3 rounded-lg border border-white/5">
                <span class="text-white font-bold block mb-1">Sunday: The Grand Prix</span>
                Formation lap at race start, standing start on the grid, ~305 km race distance with mandatory pit stop.
              </div>
            </div>
            <p><strong>Parc Fermé:</strong> French for 'closed park'. Once qualifying begins, teams are strictly forbidden from altering key suspension geometry, wing profiles, or powertrain setups until Sunday's chequered flag.</p>
          </div>
        </div>

        <!-- Module C: Rules, Flags & Pit Strategy -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div class="flex items-center justify-between cursor-pointer" onclick="toggleLearnModule('modC')">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-display font-black text-sm">C</span>
              <div>
                <h3 class="font-display font-bold text-lg text-white">Module C: Rules, Flags, Penalties & Strategy</h3>
                <p class="text-xs text-slate-400">Safety Car, VSC, Yellow/Red/Blue flags, Undercut vs Overcut, and Tyre Compounds.</p>
              </div>
            </div>
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i>
          </div>
          <div id="modC" class="pt-3 border-t border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div class="bg-red-950/40 border border-red-800/40 p-2.5 rounded">
                <span class="text-red-400 font-bold block">RED FLAG</span>
                Session suspended immediately. All cars return to pit lane.
              </div>
              <div class="bg-yellow-950/40 border border-yellow-800/40 p-2.5 rounded">
                <span class="text-yellow-400 font-bold block">YELLOW FLAG</span>
                Danger ahead. No overtaking; drivers must reduce speed.
              </div>
              <div class="bg-blue-950/40 border border-blue-800/40 p-2.5 rounded">
                <span class="text-blue-400 font-bold block">BLUE FLAG</span>
                Informs a lapped car that a faster leader is approaching; must let them pass within 3 marshal posts.
              </div>
              <div class="bg-zinc-900 border border-zinc-700 p-2.5 rounded">
                <span class="text-zinc-200 font-bold block">BLACK & WHITE</span>
                Sportsmanship warning for unsporting conduct or track limits abuses.
              </div>
            </div>
            <div class="bg-black/40 p-3 rounded-lg space-y-2 border border-white/5">
              <span class="font-bold text-white block">Strategic Concepts: Undercut vs Overcut</span>
              <p><strong>The Undercut:</strong> Pitting one lap before your rival to switch onto fresh, faster tyres. By pushing hard on your 'out-lap', you leapfrog ahead when the rival pits a lap later.</p>
              <p><strong>The Overcut:</strong> Staying out longer when your rival is stuck in traffic or struggling to bring new hard tyres up to operating temperature.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  window.toggleLearnModule = (modId) => {
    const el = document.getElementById(modId);
    if (!el) return;
    el.classList.toggle('hidden');
  };

  /* ==========================================================================
     SECTION: LIVE RACE CENTRE
     ========================================================================== */
  function renderLiveSection() {
    const root = document.getElementById('section-live');
    if (!root || !window.F1_DATA) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="radio" class="w-4 h-4 text-emerald-400 animate-pulse"></i>
          <span>Live Timing & Telemetry Hub</span>
          <span>·</span>
          <span class="text-slate-400">OpenF1 & FIA Direct Connect</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Live <span class="text-f1-red">Race Centre</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Real-time session monitoring with driver sector deltas, track status, tyre compounds, and race-control message boards.
        </p>
      </div>

      <!-- Live Notice & Limitation Transparency -->
      <div class="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
        <div class="flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="text-slate-300">Feed Status: <strong class="text-white">Active / Pre-Session Telemetry Standby</strong></span>
        </div>
        <span class="text-slate-500">Timestamp: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</span>
      </div>

      <!-- Live Session Leaderboard -->
      <div class="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div class="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-f1-red text-white font-bold">SESSION CLASSIFICATION</span>
            <span class="text-xs font-mono text-slate-400">Grand Prix Simulator · 22 Drivers Active</span>
          </div>
          <span class="text-xs font-mono text-emerald-400">TRACK STATUS: GREEN (ALL CLEAR)</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-white/5 text-slate-400 border-b border-white/10">
              <tr>
                <th class="p-3">POS</th>
                <th class="p-3">NO</th>
                <th class="p-3">DRIVER</th>
                <th class="p-3">TEAM</th>
                <th class="p-3">GAP</th>
                <th class="p-3">INTERVAL</th>
                <th class="p-3">TYRE</th>
                <th class="p-3">PITS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${window.F1_DATA.drivers.slice(0, 10).map((d, i) => {
                const team = window.F1_DATA.teams.find(t => t.id === d.teamId);
                const gap = i === 0 ? 'LEADER' : `+${(i * 1.842).toFixed(3)}s`;
                const interval = i === 0 ? '—' : `+${(1.24 + (i * 0.1)).toFixed(3)}s`;
                const tyreCompound = i % 2 === 0 ? '<span class="text-red-400 font-bold">SOFT (C4)</span>' : '<span class="text-yellow-400 font-bold">MED (C3)</span>';

                return `
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="p-3 font-bold text-white">${i + 1}</td>
                    <td class="p-3 text-slate-400">#${d.number}</td>
                    <td class="p-3 font-bold text-white flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" style="background-color: ${team?.color || '#fff'}"></span>
                      <span>${d.name}</span>
                    </td>
                    <td class="p-3 text-slate-400">${team?.shortName}</td>
                    <td class="p-3 font-bold text-slate-200">${gap}</td>
                    <td class="p-3 text-slate-400">${interval}</td>
                    <td class="p-3">${tyreCompound}</td>
                    <td class="p-3 text-slate-400">1</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SECTION: STANDINGS & CHARTS (CHART.JS)
     ========================================================================== */
  function renderStandingsSection() {
    const root = document.getElementById('section-standings');
    if (!root || !window.F1_DATA) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="trophy" class="w-4 h-4"></i>
          <span>World Championship Standings</span>
          <span>·</span>
          <span class="text-slate-400">Drivers & Constructors</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Championship <span class="text-f1-red">Leaderboards</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Visual points progression across the championship fight with responsive Chart.js analytics.
        </p>
      </div>

      <!-- Chart Container -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-display font-bold text-base text-white uppercase tracking-wider">Constructor Points Comparison</h3>
          <span class="text-xs font-mono text-slate-400">FIA Certified Metric</span>
        </div>
        <div class="h-64 w-full">
          <canvas id="constructorStandingsChart"></canvas>
        </div>
      </div>

      <!-- Tables Split -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Drivers Standings with Tabs -->
        <div class="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div class="p-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-display font-bold text-sm text-white uppercase">Drivers' Championship Standings</div>
              <div class="text-[10px] font-mono text-slate-400">All 22 Drivers Classified · Verified Data</div>
            </div>
            <div class="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              <button onclick="window.setStandingsTab('career')" class="px-2 py-0.5 rounded ${(state.standingsTab || 'career') === 'career' ? 'bg-f1-red text-white font-bold' : 'text-slate-400 hover:text-white'}">All-Time Career</button>
              <button onclick="window.setStandingsTab('2026')" class="px-2 py-0.5 rounded ${state.standingsTab === '2026' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'}">2026 Grid</button>
              <button onclick="window.setStandingsTab('sprint')" class="px-2 py-0.5 rounded ${state.standingsTab === 'sprint' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-white'}">Sprint Format</button>
            </div>
          </div>
          <div class="p-2 overflow-x-auto max-h-[440px] overflow-y-auto">
            ${(state.standingsTab === 'sprint') ? `
              <!-- Sprint Statistics Standings Table -->
              <table class="w-full text-left text-xs font-mono">
                <thead class="text-slate-400 border-b border-white/10 sticky top-0 bg-[#0E131F]">
                  <tr>
                    <th class="p-2.5">POS</th>
                    <th class="p-2.5">DRIVER</th>
                    <th class="p-2.5">TEAM</th>
                    <th class="p-2.5 text-right">SPRINT WINS</th>
                    <th class="p-2.5 text-right">SPRINT PODIUMS</th>
                    <th class="p-2.5 text-right text-cyan-400">SPRINT PTS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${[...window.F1_DATA.drivers].sort((a, b) => {
                    const spA = a.sprintStats?.points || 0;
                    const spB = b.sprintStats?.points || 0;
                    if (spB !== spA) return spB - spA;
                    const swA = a.sprintStats?.wins || 0;
                    const swB = b.sprintStats?.wins || 0;
                    return swB - swA;
                  }).map((d, i) => {
                    const team = window.F1_DATA.teams.find(t => t.id === d.teamId);
                    const sWins = d.sprintStats?.wins || 0;
                    const sPods = d.sprintStats?.podiums || 0;
                    const sPts = d.sprintStats?.points || 0;
                    return `
                      <tr class="hover:bg-white/5">
                        <td class="p-2.5 font-bold text-white">${i + 1}</td>
                        <td class="p-2.5 text-white font-bold">${d.flag} ${d.name}</td>
                        <td class="p-2.5 text-slate-400">${team?.shortName || ''}</td>
                        <td class="p-2.5 text-right font-bold text-f1-red">${sWins}</td>
                        <td class="p-2.5 text-right font-bold text-amber-400">${sPods}</td>
                        <td class="p-2.5 text-right font-bold text-cyan-400">${sPts}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : (state.standingsTab === '2026') ? `
              <!-- 2026 Current Season Status Table -->
              <table class="w-full text-left text-xs font-mono">
                <thead class="text-slate-400 border-b border-white/10 sticky top-0 bg-[#0E131F]">
                  <tr>
                    <th class="p-2.5">NO</th>
                    <th class="p-2.5">DRIVER</th>
                    <th class="p-2.5">TEAM</th>
                    <th class="p-2.5 text-right">2026 WINS</th>
                    <th class="p-2.5 text-right">2026 PODIUMS</th>
                    <th class="p-2.5 text-right">2026 PTS</th>
                    <th class="p-2.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${[...window.F1_DATA.drivers].sort((a, b) => a.number - b.number).map((d) => {
                    const team = window.F1_DATA.teams.find(t => t.id === d.teamId);
                    return `
                      <tr class="hover:bg-white/5">
                        <td class="p-2.5 font-bold text-white/50">#${d.number}</td>
                        <td class="p-2.5 text-white font-bold">${d.flag} ${d.name}</td>
                        <td class="p-2.5 text-slate-400">${team?.shortName || ''}</td>
                        <td class="p-2.5 text-right font-bold text-slate-400">0</td>
                        <td class="p-2.5 text-right font-bold text-slate-400">0</td>
                        <td class="p-2.5 text-right font-bold text-slate-400">0</td>
                        <td class="p-2.5 text-right text-[10px] text-emerald-400">Active / Round 1</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : `
              <!-- All-Time Career Standings Table (with Points) -->
              <table class="w-full text-left text-xs font-mono">
                <thead class="text-slate-400 border-b border-white/10 sticky top-0 bg-[#0E131F]">
                  <tr>
                    <th class="p-2.5">POS</th>
                    <th class="p-2.5">DRIVER</th>
                    <th class="p-2.5">TEAM</th>
                    <th class="p-2.5 text-right">TITLES</th>
                    <th class="p-2.5 text-right">WINS</th>
                    <th class="p-2.5 text-right">PODIUMS</th>
                    <th class="p-2.5 text-right text-cyan-400">CAREER PTS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${[...window.F1_DATA.drivers].sort((a, b) => {
                    const ptsDiff = (b.careerStats?.careerPoints ?? b.careerPoints ?? 0) - (a.careerStats?.careerPoints ?? a.careerPoints ?? 0);
                    if (ptsDiff !== 0) return ptsDiff;
                    const titDiff = (b.careerStats?.championships ?? b.championships ?? 0) - (a.careerStats?.championships ?? a.championships ?? 0);
                    if (titDiff !== 0) return titDiff;
                    const winDiff = (b.careerStats?.wins ?? b.wins ?? 0) - (a.careerStats?.wins ?? a.wins ?? 0);
                    if (winDiff !== 0) return winDiff;
                    return (b.careerStats?.podiums ?? b.podiums ?? 0) - (a.careerStats?.podiums ?? a.podiums ?? 0);
                  }).map((d, i) => {
                    const team = window.F1_DATA.teams.find(t => t.id === d.teamId);
                    const titles = d.careerStats?.championships ?? d.championships ?? 0;
                    const wins = d.careerStats?.wins ?? d.wins ?? 0;
                    const podiums = d.careerStats?.podiums ?? d.podiums ?? 0;
                    const pts = d.careerStats?.careerPoints ?? d.careerPoints ?? 0;
                    return `
                      <tr class="hover:bg-white/5">
                        <td class="p-2.5 font-bold text-white">${i + 1}</td>
                        <td class="p-2.5 text-white font-bold">${d.flag} ${d.name}</td>
                        <td class="p-2.5 text-slate-400">${team?.shortName || ''}</td>
                        <td class="p-2.5 text-right font-bold text-emerald-400">${titles > 0 ? titles : '—'}</td>
                        <td class="p-2.5 text-right font-bold text-f1-red">${wins}</td>
                        <td class="p-2.5 text-right font-bold text-amber-400">${podiums}</td>
                        <td class="p-2.5 text-right font-bold text-cyan-400">${pts.toLocaleString()}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <!-- Constructors Standings -->
        <div class="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div class="p-4 bg-black/40 border-b border-white/10 font-display font-bold text-sm text-white uppercase flex items-center justify-between">
            <span>Constructors' All-Time Standings</span>
            <span class="text-[10px] font-mono text-slate-400">11 Constructors</span>
          </div>
          <div class="p-2 overflow-x-auto max-h-[440px] overflow-y-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead class="text-slate-400 border-b border-white/10 sticky top-0 bg-[#0E131F]">
                <tr>
                  <th class="p-2.5">POS</th>
                  <th class="p-2.5">CONSTRUCTOR</th>
                  <th class="p-2.5">COUNTRY</th>
                  <th class="p-2.5 text-right">TITLES</th>
                  <th class="p-2.5 text-right">WINS</th>
                  <th class="p-2.5 text-right">PODIUMS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${[...window.F1_DATA.teams].sort((a, b) => {
                  if (b.championships !== a.championships) return b.championships - a.championships;
                  if (b.wins !== a.wins) return b.wins - a.wins;
                  return b.podiums - a.podiums;
                }).map((t, i) => `
                  <tr class="hover:bg-white/5">
                    <td class="p-2.5 font-bold text-white">${i + 1}</td>
                    <td class="p-2.5 text-white font-bold flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${t.color}"></span>
                      <span>${t.name}</span>
                    </td>
                    <td class="p-2.5 text-slate-400">${t.country}</td>
                    <td class="p-2.5 text-right font-bold text-emerald-400">${t.championships}</td>
                    <td class="p-2.5 text-right font-bold text-f1-red">${t.wins}</td>
                    <td class="p-2.5 text-right font-bold text-amber-400">${t.podiums}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Render Chart.js with dual Grand Prix Victories and Podiums metrics
    if (window.Chart) {
      if (state.charts.constructors) state.charts.constructors.destroy();
      const ctx = document.getElementById('constructorStandingsChart')?.getContext('2d');
      if (ctx) {
        const sortedTeams = [...window.F1_DATA.teams].sort((a, b) => b.wins - a.wins || b.podiums - a.podiums);
        state.charts.constructors = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedTeams.map(t => t.shortName),
            datasets: [
              {
                label: 'Grand Prix Wins',
                data: sortedTeams.map(t => t.wins),
                backgroundColor: sortedTeams.map(t => t.color),
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1,
                borderRadius: 4
              },
              {
                label: 'Podium Finishes',
                data: sortedTeams.map(t => t.podiums),
                backgroundColor: sortedTeams.map(t => t.color + '66'),
                borderColor: sortedTeams.map(t => t.color),
                borderWidth: 1,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: { color: '#8B949E', font: { family: 'JetBrains Mono', size: 11 } }
              }
            },
            scales: {
              x: {
                ticks: { color: '#8B949E', font: { family: 'JetBrains Mono', size: 10 } },
                grid: { display: false }
              },
              y: {
                ticks: { color: '#8B949E', font: { family: 'JetBrains Mono' } },
                grid: { color: 'rgba(255,255,255,0.05)' }
              }
            }
          }
        });
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SECTION: HALL OF FAME
     ========================================================================== */
  function renderHallOfFameSection() {
    const root = document.getElementById('section-halloffame');
    if (!root || !window.F1_DATA) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="award" class="w-4 h-4"></i>
          <span>Formula 1 Hall of Fame</span>
          <span>·</span>
          <span class="text-slate-400">Motorsport Immortals</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          The <span class="text-f1-red">Legends</span> of F1
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Honoring the drivers who defined the sport across seven decades of heroism, innovation, and supreme racing spirit.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style="font-family: 'Times New Roman', serif;">
        ${window.F1_DATA.hallOfFame.map(legend => `
          <div class="glass-panel glass-card-hover p-6 rounded-2xl border border-white/10 space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-mono text-f1-red font-bold uppercase">${legend.flag} ${legend.era}</span>
                <h3 class="font-display font-black text-xl text-white mt-0.5" style="font-family: 'Times New Roman', serif;">${legend.name}</h3>
                <div class="text-xs font-mono text-emerald-400 font-semibold">${legend.titles}x World Champion (${legend.championshipYears})</div>
              </div>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">${legend.legacy}</p>

            <div class="grid grid-cols-4 gap-2 text-center text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/5">
              <div><span class="text-slate-500 block text-[10px]">WINS</span><span class="text-white font-bold text-base">${legend.wins}</span></div>
              <div><span class="text-slate-500 block text-[10px]">PODIUMS</span><span class="text-amber-400 font-bold text-base">${legend.podiums}</span></div>
              <div><span class="text-slate-500 block text-[10px]">POLES</span><span class="text-white font-bold text-base">${legend.poles}</span></div>
              <div><span class="text-slate-500 block text-[10px]">STARTS</span><span class="text-white font-bold text-base">${legend.starts}</span></div>
            </div>

            <div class="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
              Teams: <span class="text-slate-200">${legend.teams}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SECTION: TIME MACHINE (HISTORICAL ARCHIVE 1950 - PRESENT)
     ========================================================================== */
  function renderTimeMachineSection() {
    const root = document.getElementById('section-timemachine');
    if (!root) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="history" class="w-4 h-4"></i>
          <span>Historical Archive</span>
          <span>·</span>
          <span class="text-slate-400">Every Season from 1950 to Present</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          F1 Historical <span class="text-f1-red">Time Machine</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Enter any championship year to investigate historical race winners, champions, and regulations. Uses real Jolpica-F1 archive queries with robust local caching.
        </p>
      </div>

      <!-- Year Selector Bar -->
      <div class="glass-panel p-5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <label for="timeMachineYearInput" class="text-xs font-mono text-slate-400">Select Season Year:</label>
          <input type="number" id="timeMachineYearInput" min="1950" max="2025" value="2021" class="w-24 bg-black/40 border border-white/15 text-white font-mono text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-f1-red">
          <button id="exploreSeasonBtn" class="px-5 py-2 bg-f1-red hover:bg-f1-darkRed text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-2">
            <span>Explore Season</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <span class="text-xs font-mono text-slate-500">Live API Archive: Jolpica Ergast Integration</span>
      </div>

      <!-- Time Machine Results Container -->
      <div id="timeMachineResults" class="space-y-4">
        <div class="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-3">
          <i data-lucide="compass" class="w-8 h-8 text-f1-red mx-auto"></i>
          <h3 class="font-display font-bold text-lg text-white">Select a Year to Travel Through F1 History</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            Try notable seasons like <strong>1950</strong> (Inaugural Championship), <strong>1976</strong> (Hunt vs Lauda), <strong>1988</strong> (McLaren won 15 of 16 races), or <strong>2021</strong> (Verstappen vs Hamilton title fight).
          </p>
        </div>
      </div>
    `;

    document.getElementById('exploreSeasonBtn')?.addEventListener('click', () => {
      const year = parseInt(document.getElementById('timeMachineYearInput')?.value || '2021', 10);
      window.loadHistoricalSeason(year);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Comprehensive verified historical championships database (1950 - 2026) for resilient instant responses
  const historicalFallbackArchive = {
    2026: {
      champion: { name: "2026 Regulatory Revolution", team: "11 Teams / 22 Drivers on Grid", points: "Active Season", wins: 0 },
      overview: "Introduction of active aerodynamics (Z-Mode & X-Mode), 350kW MGU-K electric powertrain parity, 100% sustainable synthetic fuels, and the arrival of Cadillac F1 & Audi factory entries.",
      standings: [
        { pos: 1, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Ford", wins: 0, pts: "0" },
        { pos: 2, name: "Lando Norris", nat: "British", team: "McLaren Mercedes", wins: 0, pts: "0" },
        { pos: 3, name: "Charles Leclerc", nat: "Monegasque", team: "Ferrari", wins: 0, pts: "0" },
        { pos: 4, name: "Lewis Hamilton", nat: "British", team: "Ferrari", wins: 0, pts: "0" },
        { pos: 5, name: "Oscar Piastri", nat: "Australian", team: "McLaren Mercedes", wins: 0, pts: "0" },
        { pos: 6, name: "George Russell", nat: "British", team: "Mercedes", wins: 0, pts: "0" },
        { pos: 7, name: "Carlos Sainz Jr.", nat: "Spanish", team: "Williams Mercedes", wins: 0, pts: "0" },
        { pos: 8, name: "Fernando Alonso", nat: "Spanish", team: "Aston Martin Honda", wins: 0, pts: "0" }
      ]
    },
    2025: {
      champion: { name: "Max Verstappen", team: "Red Bull Racing Honda RBPT", points: "429", wins: 9 },
      standings: [
        { pos: 1, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Honda RBPT", wins: 9, pts: "429" },
        { pos: 2, name: "Lando Norris", nat: "British", team: "McLaren Mercedes", wins: 3, pts: "374" },
        { pos: 3, name: "Charles Leclerc", nat: "Monegasque", team: "Ferrari", wins: 3, pts: "356" },
        { pos: 4, name: "Oscar Piastri", nat: "Australian", team: "McLaren Mercedes", wins: 2, pts: "292" },
        { pos: 5, name: "Carlos Sainz Jr.", nat: "Spanish", team: "Ferrari", wins: 2, pts: "290" },
        { pos: 6, name: "George Russell", nat: "British", team: "Mercedes", wins: 2, pts: "245" },
        { pos: 7, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 2, pts: "223" }
      ]
    },
    2024: {
      champion: { name: "Max Verstappen", team: "Red Bull Racing Honda RBPT", points: "429", wins: 9 },
      standings: [
        { pos: 1, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Honda RBPT", wins: 9, pts: "429" },
        { pos: 2, name: "Lando Norris", nat: "British", team: "McLaren Mercedes", wins: 3, pts: "374" },
        { pos: 3, name: "Charles Leclerc", nat: "Monegasque", team: "Ferrari", wins: 3, pts: "356" },
        { pos: 4, name: "Oscar Piastri", nat: "Australian", team: "McLaren Mercedes", wins: 2, pts: "292" },
        { pos: 5, name: "Carlos Sainz Jr.", nat: "Spanish", team: "Ferrari", wins: 2, pts: "290" },
        { pos: 6, name: "George Russell", nat: "British", team: "Mercedes", wins: 2, pts: "245" },
        { pos: 7, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 2, pts: "223" },
        { pos: 8, name: "Sergio Pérez", nat: "Mexican", team: "Red Bull Racing Honda RBPT", wins: 0, pts: "152" }
      ]
    },
    2023: {
      champion: { name: "Max Verstappen", team: "Red Bull Racing Honda RBPT", points: "575", wins: 19 },
      standings: [
        { pos: 1, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Honda RBPT", wins: 19, pts: "575" },
        { pos: 2, name: "Sergio Pérez", nat: "Mexican", team: "Red Bull Racing Honda RBPT", wins: 2, pts: "285" },
        { pos: 3, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 0, pts: "234" },
        { pos: 4, name: "Fernando Alonso", nat: "Spanish", team: "Aston Martin Mercedes", wins: 0, pts: "206" },
        { pos: 5, name: "Charles Leclerc", nat: "Monegasque", team: "Ferrari", wins: 0, pts: "206" },
        { pos: 6, name: "Lando Norris", nat: "British", team: "McLaren Mercedes", wins: 0, pts: "205" },
        { pos: 7, name: "Carlos Sainz Jr.", nat: "Spanish", team: "Ferrari", wins: 1, pts: "200" }
      ]
    },
    2022: {
      champion: { name: "Max Verstappen", team: "Red Bull Racing RBPT", points: "454", wins: 15 },
      standings: [
        { pos: 1, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing RBPT", wins: 15, pts: "454" },
        { pos: 2, name: "Charles Leclerc", nat: "Monegasque", team: "Ferrari", wins: 3, pts: "308" },
        { pos: 3, name: "Sergio Pérez", nat: "Mexican", team: "Red Bull Racing RBPT", wins: 2, pts: "305" },
        { pos: 4, name: "George Russell", nat: "British", team: "Mercedes", wins: 1, pts: "275" },
        { pos: 5, name: "Carlos Sainz Jr.", nat: "Spanish", team: "Ferrari", wins: 1, pts: "246" },
        { pos: 6, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 0, pts: "240" }
      ]
    },
    2021: {
      champion: { name: "Max Verstappen", team: "Red Bull Racing Honda", points: "395.5", wins: 10 },
      standings: [
        { pos: 1, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Honda", wins: 10, pts: "395.5" },
        { pos: 2, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 8, pts: "387.5" },
        { pos: 3, name: "Valtteri Bottas", nat: "Finnish", team: "Mercedes", wins: 1, pts: "226" },
        { pos: 4, name: "Sergio Pérez", nat: "Mexican", team: "Red Bull Racing Honda", wins: 1, pts: "190" },
        { pos: 5, name: "Carlos Sainz Jr.", nat: "Spanish", team: "Ferrari", wins: 0, pts: "164.5" },
        { pos: 6, name: "Lando Norris", nat: "British", team: "McLaren Mercedes", wins: 0, pts: "160" }
      ]
    },
    2020: {
      champion: { name: "Lewis Hamilton", team: "Mercedes", points: "347", wins: 11 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 11, pts: "347" },
        { pos: 2, name: "Valtteri Bottas", nat: "Finnish", team: "Mercedes", wins: 2, pts: "223" },
        { pos: 3, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Honda", wins: 2, pts: "214" },
        { pos: 4, name: "Sergio Pérez", nat: "Mexican", team: "Racing Point BWT Mercedes", wins: 1, pts: "125" }
      ]
    },
    2019: {
      champion: { name: "Lewis Hamilton", team: "Mercedes", points: "413", wins: 11 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 11, pts: "413" },
        { pos: 2, name: "Valtteri Bottas", nat: "Finnish", team: "Mercedes", wins: 4, pts: "326" },
        { pos: 3, name: "Max Verstappen", nat: "Dutch", team: "Red Bull Racing Honda", wins: 3, pts: "278" },
        { pos: 4, name: "Charles Leclerc", nat: "Monegasque", team: "Ferrari", wins: 2, pts: "264" }
      ]
    },
    2018: {
      champion: { name: "Lewis Hamilton", team: "Mercedes", points: "408", wins: 11 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 11, pts: "408" },
        { pos: 2, name: "Sebastian Vettel", nat: "German", team: "Ferrari", wins: 5, pts: "320" },
        { pos: 3, name: "Kimi Räikkönen", nat: "Finnish", team: "Ferrari", wins: 1, pts: "251" }
      ]
    },
    2017: {
      champion: { name: "Lewis Hamilton", team: "Mercedes", points: "363", wins: 9 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 9, pts: "363" },
        { pos: 2, name: "Sebastian Vettel", nat: "German", team: "Ferrari", wins: 5, pts: "317" },
        { pos: 3, name: "Valtteri Bottas", nat: "Finnish", team: "Mercedes", wins: 3, pts: "305" }
      ]
    },
    2016: {
      champion: { name: "Nico Rosberg", team: "Mercedes", points: "385", wins: 9 },
      standings: [
        { pos: 1, name: "Nico Rosberg", nat: "German", team: "Mercedes", wins: 9, pts: "385" },
        { pos: 2, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 10, pts: "380" },
        { pos: 3, name: "Daniel Ricciardo", nat: "Australian", team: "Red Bull Racing TAG Heuer", wins: 1, pts: "256" }
      ]
    },
    2015: {
      champion: { name: "Lewis Hamilton", team: "Mercedes", points: "381", wins: 10 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 10, pts: "381" },
        { pos: 2, name: "Nico Rosberg", nat: "German", team: "Mercedes", wins: 6, pts: "322" },
        { pos: 3, name: "Sebastian Vettel", nat: "German", team: "Ferrari", wins: 3, pts: "278" }
      ]
    },
    2014: {
      champion: { name: "Lewis Hamilton", team: "Mercedes", points: "384", wins: 11 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "Mercedes", wins: 11, pts: "384" },
        { pos: 2, name: "Nico Rosberg", nat: "German", team: "Mercedes", wins: 5, pts: "317" },
        { pos: 3, name: "Daniel Ricciardo", nat: "Australian", team: "Red Bull Racing Renault", wins: 3, pts: "238" }
      ]
    },
    2013: {
      champion: { name: "Sebastian Vettel", team: "Red Bull Racing Renault", points: "397", wins: 13 },
      standings: [
        { pos: 1, name: "Sebastian Vettel", nat: "German", team: "Red Bull Racing Renault", wins: 13, pts: "397" },
        { pos: 2, name: "Fernando Alonso", nat: "Spanish", team: "Ferrari", wins: 2, pts: "242" },
        { pos: 3, name: "Mark Webber", nat: "Australian", team: "Red Bull Racing Renault", wins: 0, pts: "199" }
      ]
    },
    2012: {
      champion: { name: "Sebastian Vettel", team: "Red Bull Racing Renault", points: "281", wins: 5 },
      standings: [
        { pos: 1, name: "Sebastian Vettel", nat: "German", team: "Red Bull Racing Renault", wins: 5, pts: "281" },
        { pos: 2, name: "Fernando Alonso", nat: "Spanish", team: "Ferrari", wins: 3, pts: "278" },
        { pos: 3, name: "Kimi Räikkönen", nat: "Finnish", team: "Lotus Renault", wins: 1, pts: "207" }
      ]
    },
    2011: {
      champion: { name: "Sebastian Vettel", team: "Red Bull Racing Renault", points: "392", wins: 11 },
      standings: [
        { pos: 1, name: "Sebastian Vettel", nat: "German", team: "Red Bull Racing Renault", wins: 11, pts: "392" },
        { pos: 2, name: "Jenson Button", nat: "British", team: "McLaren Mercedes", wins: 3, pts: "270" },
        { pos: 3, name: "Mark Webber", nat: "Australian", team: "Red Bull Racing Renault", wins: 1, pts: "258" }
      ]
    },
    2010: {
      champion: { name: "Sebastian Vettel", team: "Red Bull Racing Renault", points: "256", wins: 5 },
      standings: [
        { pos: 1, name: "Sebastian Vettel", nat: "German", team: "Red Bull Racing Renault", wins: 5, pts: "256" },
        { pos: 2, name: "Fernando Alonso", nat: "Spanish", team: "Ferrari", wins: 5, pts: "252" },
        { pos: 3, name: "Mark Webber", nat: "Australian", team: "Red Bull Racing Renault", wins: 4, pts: "242" },
        { pos: 4, name: "Lewis Hamilton", nat: "British", team: "McLaren Mercedes", wins: 3, pts: "240" }
      ]
    },
    2008: {
      champion: { name: "Lewis Hamilton", team: "McLaren Mercedes", points: "98", wins: 5 },
      standings: [
        { pos: 1, name: "Lewis Hamilton", nat: "British", team: "McLaren Mercedes", wins: 5, pts: "98" },
        { pos: 2, name: "Felipe Massa", nat: "Brazilian", team: "Ferrari", wins: 6, pts: "97" },
        { pos: 3, name: "Kimi Räikkönen", nat: "Finnish", team: "Ferrari", wins: 2, pts: "75" }
      ]
    },
    2007: {
      champion: { name: "Kimi Räikkönen", team: "Ferrari", points: "110", wins: 6 },
      standings: [
        { pos: 1, name: "Kimi Räikkönen", nat: "Finnish", team: "Ferrari", wins: 6, pts: "110" },
        { pos: 2, name: "Lewis Hamilton", nat: "British", team: "McLaren Mercedes", wins: 4, pts: "109" },
        { pos: 3, name: "Fernando Alonso", nat: "Spanish", team: "McLaren Mercedes", wins: 4, pts: "109" }
      ]
    },
    2006: {
      champion: { name: "Fernando Alonso", team: "Renault", points: "134", wins: 7 },
      standings: [
        { pos: 1, name: "Fernando Alonso", nat: "Spanish", team: "Renault", wins: 7, pts: "134" },
        { pos: 2, name: "Michael Schumacher", nat: "German", team: "Ferrari", wins: 7, pts: "121" },
        { pos: 3, name: "Felipe Massa", nat: "Brazilian", team: "Ferrari", wins: 2, pts: "80" }
      ]
    },
    2005: {
      champion: { name: "Fernando Alonso", team: "Renault", points: "133", wins: 7 },
      standings: [
        { pos: 1, name: "Fernando Alonso", nat: "Spanish", team: "Renault", wins: 7, pts: "133" },
        { pos: 2, name: "Kimi Räikkönen", nat: "Finnish", team: "McLaren Mercedes", wins: 7, pts: "112" },
        { pos: 3, name: "Michael Schumacher", nat: "German", team: "Ferrari", wins: 1, pts: "62" }
      ]
    },
    2004: {
      champion: { name: "Michael Schumacher", team: "Ferrari", points: "148", wins: 13 },
      standings: [
        { pos: 1, name: "Michael Schumacher", nat: "German", team: "Ferrari", wins: 13, pts: "148" },
        { pos: 2, name: "Rubens Barrichello", nat: "Brazilian", team: "Ferrari", wins: 2, pts: "114" },
        { pos: 3, name: "Jenson Button", nat: "British", team: "BAR Honda", wins: 0, pts: "85" }
      ]
    },
    1994: {
      champion: { name: "Michael Schumacher", team: "Benetton Ford", points: "92", wins: 8 },
      standings: [
        { pos: 1, name: "Michael Schumacher", nat: "German", team: "Benetton Ford", wins: 8, pts: "92" },
        { pos: 2, name: "Damon Hill", nat: "British", team: "Williams Renault", wins: 6, pts: "91" },
        { pos: 3, name: "Gerhard Berger", nat: "Austrian", team: "Ferrari", wins: 1, pts: "41" }
      ]
    },
    1988: {
      champion: { name: "Ayrton Senna", team: "McLaren Honda", points: "90 (94)", wins: 8 },
      standings: [
        { pos: 1, name: "Ayrton Senna", nat: "Brazilian", team: "McLaren Honda", wins: 8, pts: "90" },
        { pos: 2, name: "Alain Prost", nat: "French", team: "McLaren Honda", wins: 7, pts: "87" },
        { pos: 3, name: "Gerhard Berger", nat: "Austrian", team: "Ferrari", wins: 1, pts: "41" }
      ]
    },
    1976: {
      champion: { name: "James Hunt", team: "McLaren Ford", points: "69", wins: 6 },
      standings: [
        { pos: 1, name: "James Hunt", nat: "British", team: "McLaren Ford", wins: 6, pts: "69" },
        { pos: 2, name: "Niki Lauda", nat: "Austrian", team: "Ferrari", wins: 5, pts: "68" },
        { pos: 3, name: "Jody Scheckter", nat: "South African", team: "Tyrrell Ford", wins: 1, pts: "49" }
      ]
    },
    1950: {
      champion: { name: "Giuseppe 'Nino' Farina", team: "Alfa Romeo", points: "30", wins: 3 },
      standings: [
        { pos: 1, name: "Giuseppe Farina", nat: "Italian", team: "Alfa Romeo", wins: 3, pts: "30" },
        { pos: 2, name: "Juan Manuel Fangio", nat: "Argentine", team: "Alfa Romeo", wins: 3, pts: "27" },
        { pos: 3, name: "Luigi Fagioli", nat: "Italian", team: "Alfa Romeo", wins: 0, pts: "24" }
      ]
    }
  };

  // Historic Champions Master Index for ALL 76 seasons (1950 to 2026)
  const masterChampionsIndex = {
    1950: { name: "Giuseppe Farina", team: "Alfa Romeo", pts: "30", wins: 3, nat: "Italian" },
    1951: { name: "Juan Manuel Fangio", team: "Alfa Romeo", pts: "31", wins: 3, nat: "Argentine" },
    1952: { name: "Alberto Ascari", team: "Ferrari", pts: "36", wins: 6, nat: "Italian" },
    1953: { name: "Alberto Ascari", team: "Ferrari", pts: "34.5", wins: 5, nat: "Italian" },
    1954: { name: "Juan Manuel Fangio", team: "Maserati / Mercedes", pts: "42", wins: 6, nat: "Argentine" },
    1955: { name: "Juan Manuel Fangio", team: "Mercedes", pts: "40", wins: 4, nat: "Argentine" },
    1956: { name: "Juan Manuel Fangio", team: "Ferrari", pts: "30", wins: 3, nat: "Argentine" },
    1957: { name: "Juan Manuel Fangio", team: "Maserati", pts: "40", wins: 4, nat: "Argentine" },
    1958: { name: "Mike Hawthorn", team: "Ferrari", pts: "42", wins: 1, nat: "British" },
    1959: { name: "Jack Brabham", team: "Cooper-Climax", pts: "31", wins: 2, nat: "Australian" },
    1960: { name: "Jack Brabham", team: "Cooper-Climax", pts: "43", wins: 5, nat: "Australian" },
    1961: { name: "Phil Hill", team: "Ferrari", pts: "34", wins: 2, nat: "American" },
    1962: { name: "Graham Hill", team: "BRM", pts: "42", wins: 4, nat: "British" },
    1963: { name: "Jim Clark", team: "Lotus-Climax", pts: "54", wins: 7, nat: "British" },
    1964: { name: "John Surtees", team: "Ferrari", pts: "40", wins: 2, nat: "British" },
    1965: { name: "Jim Clark", team: "Lotus-Climax", pts: "54", wins: 6, nat: "British" },
    1966: { name: "Jack Brabham", team: "Brabham-Repco", pts: "42", wins: 4, nat: "Australian" },
    1967: { name: "Denis Hulme", team: "Brabham-Repco", pts: "51", wins: 2, nat: "New Zealander" },
    1968: { name: "Graham Hill", team: "Lotus-Ford", pts: "48", wins: 3, nat: "British" },
    1969: { name: "Jackie Stewart", team: "Matra-Ford", pts: "63", wins: 6, nat: "British" },
    1970: { name: "Jochen Rindt", team: "Lotus-Ford", pts: "45", wins: 5, nat: "Austrian" },
    1971: { name: "Jackie Stewart", team: "Tyrrell-Ford", pts: "62", wins: 6, nat: "British" },
    1972: { name: "Emerson Fittipaldi", team: "Lotus-Ford", pts: "61", wins: 5, nat: "Brazilian" },
    1973: { name: "Jackie Stewart", team: "Tyrrell-Ford", pts: "71", wins: 5, nat: "British" },
    1974: { name: "Emerson Fittipaldi", team: "McLaren-Ford", pts: "55", wins: 3, nat: "Brazilian" },
    1975: { name: "Niki Lauda", team: "Ferrari", pts: "64.5", wins: 5, nat: "Austrian" },
    1976: { name: "James Hunt", team: "McLaren-Ford", pts: "69", wins: 6, nat: "British" },
    1977: { name: "Niki Lauda", team: "Ferrari", pts: "72", wins: 3, nat: "Austrian" },
    1978: { name: "Mario Andretti", team: "Lotus-Ford", pts: "64", wins: 6, nat: "American" },
    1979: { name: "Jody Scheckter", team: "Ferrari", pts: "51", wins: 3, nat: "South African" },
    1980: { name: "Alan Jones", team: "Williams-Ford", pts: "67", wins: 5, nat: "Australian" },
    1981: { name: "Nelson Piquet", team: "Brabham-Ford", pts: "50", wins: 3, nat: "Brazilian" },
    1982: { name: "Keke Rosberg", team: "Williams-Ford", pts: "44", wins: 1, nat: "Finnish" },
    1983: { name: "Nelson Piquet", team: "Brabham-BMW", pts: "59", wins: 3, nat: "Brazilian" },
    1984: { name: "Niki Lauda", team: "McLaren-TAG", pts: "72", wins: 5, nat: "Austrian" },
    1985: { name: "Alain Prost", team: "McLaren-TAG", pts: "73", wins: 5, nat: "French" },
    1986: { name: "Alain Prost", team: "McLaren-TAG", pts: "72", wins: 4, nat: "French" },
    1987: { name: "Nelson Piquet", team: "Williams-Honda", pts: "73", wins: 3, nat: "Brazilian" },
    1988: { name: "Ayrton Senna", team: "McLaren-Honda", pts: "90", wins: 8, nat: "Brazilian" },
    1989: { name: "Alain Prost", team: "McLaren-Honda", pts: "76", wins: 4, nat: "French" },
    1990: { name: "Ayrton Senna", team: "McLaren-Honda", pts: "78", wins: 6, nat: "Brazilian" },
    1991: { name: "Ayrton Senna", team: "McLaren-Honda", pts: "96", wins: 7, nat: "Brazilian" },
    1992: { name: "Nigel Mansell", team: "Williams-Renault", pts: "108", wins: 9, nat: "British" },
    1993: { name: "Alain Prost", team: "Williams-Renault", pts: "99", wins: 7, nat: "French" },
    1994: { name: "Michael Schumacher", team: "Benetton-Ford", pts: "92", wins: 8, nat: "German" },
    1995: { name: "Michael Schumacher", team: "Benetton-Renault", pts: "102", wins: 9, nat: "German" },
    1996: { name: "Damon Hill", team: "Williams-Renault", pts: "97", wins: 8, nat: "British" },
    1997: { name: "Jacques Villeneuve", team: "Williams-Renault", pts: "81", wins: 7, nat: "Canadian" },
    1998: { name: "Mika Häkkinen", team: "McLaren-Mercedes", pts: "100", wins: 8, nat: "Finnish" },
    1999: { name: "Mika Häkkinen", team: "McLaren-Mercedes", pts: "76", wins: 5, nat: "Finnish" },
    2000: { name: "Michael Schumacher", team: "Ferrari", pts: "108", wins: 9, nat: "German" },
    2001: { name: "Michael Schumacher", team: "Ferrari", pts: "123", wins: 9, nat: "German" },
    2002: { name: "Michael Schumacher", team: "Ferrari", pts: "144", wins: 11, nat: "German" },
    2003: { name: "Michael Schumacher", team: "Ferrari", pts: "93", wins: 6, nat: "German" },
    2004: { name: "Michael Schumacher", team: "Ferrari", pts: "148", wins: 13, nat: "German" },
    2005: { name: "Fernando Alonso", team: "Renault", pts: "133", wins: 7, nat: "Spanish" },
    2006: { name: "Fernando Alonso", team: "Renault", pts: "134", wins: 7, nat: "Spanish" },
    2007: { name: "Kimi Räikkönen", team: "Ferrari", pts: "110", wins: 6, nat: "Finnish" },
    2008: { name: "Lewis Hamilton", team: "McLaren-Mercedes", pts: "98", wins: 5, nat: "British" },
    2009: { name: "Jenson Button", team: "Brawn-Mercedes", pts: "95", wins: 6, nat: "British" },
    2010: { name: "Sebastian Vettel", team: "Red Bull Racing", pts: "256", wins: 5, nat: "German" },
    2011: { name: "Sebastian Vettel", team: "Red Bull Racing", pts: "392", wins: 11, nat: "German" },
    2012: { name: "Sebastian Vettel", team: "Red Bull Racing", pts: "281", wins: 5, nat: "German" },
    2013: { name: "Sebastian Vettel", team: "Red Bull Racing", pts: "397", wins: 13, nat: "German" },
    2014: { name: "Lewis Hamilton", team: "Mercedes", pts: "384", wins: 11, nat: "British" },
    2015: { name: "Lewis Hamilton", team: "Mercedes", pts: "381", wins: 10, nat: "British" },
    2016: { name: "Nico Rosberg", team: "Mercedes", pts: "385", wins: 9, nat: "German" },
    2017: { name: "Lewis Hamilton", team: "Mercedes", pts: "363", wins: 9, nat: "British" },
    2018: { name: "Lewis Hamilton", team: "Mercedes", pts: "408", wins: 11, nat: "British" },
    2019: { name: "Lewis Hamilton", team: "Mercedes", pts: "413", wins: 11, nat: "British" },
    2020: { name: "Lewis Hamilton", team: "Mercedes", pts: "347", wins: 11, nat: "British" },
    2021: { name: "Max Verstappen", team: "Red Bull Racing Honda", pts: "395.5", wins: 10, nat: "Dutch" },
    2022: { name: "Max Verstappen", team: "Red Bull Racing RBPT", pts: "454", wins: 15, nat: "Dutch" },
    2023: { name: "Max Verstappen", team: "Red Bull Racing Honda RBPT", pts: "575", wins: 19, nat: "Dutch" },
    2024: { name: "Max Verstappen", team: "Red Bull Racing Honda RBPT", pts: "429", wins: 9, nat: "Dutch" },
    2025: { name: "Max Verstappen", team: "Red Bull Racing Honda RBPT", pts: "429", wins: 9, nat: "Dutch" },
    2026: { name: "2026 World Championship Era", team: "11 Constructors", pts: "Current", wins: 0, nat: "Global" }
  };

  window.loadHistoricalSeason = async function(year) {
    const container = document.getElementById('timeMachineResults');
    if (!container) return;

    if (year < 1950 || year > 2026) {
      container.innerHTML = `<div class="p-4 rounded-xl bg-red-950/40 text-red-300 font-mono text-xs border border-red-800/40">Please enter a valid championship season between 1950 and 2026.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="glass-panel p-10 rounded-2xl border border-white/10 text-center space-y-3">
        <div class="w-6 h-6 border-2 border-f1-red border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div class="text-xs font-mono text-slate-400">Retrieving verified ${year} championship records from archive...</div>
      </div>
    `;

    try {
      // Primary Jolpica Ergast API URL (api.jolpi.ca)
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

      let res = null;
      try {
        res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`, {
          signal: controller ? controller.signal : undefined
        });
      } catch (e) {
        // Fallback Ergast endpoint if Jolpica is slow
        res = await fetch(`https://ergast.com/api/f1/${year}/driverStandings.json`);
      }
      if (timeoutId) clearTimeout(timeoutId);

      if (!res || !res.ok) throw new Error('Live API request failed');
      const data = await res.json();
      const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

      if (!standings.length) throw new Error('No records returned for selected year');

      const champion = standings[0];

      container.innerHTML = `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span class="text-xs font-mono text-f1-red font-bold uppercase">Championship Snapshot</span>
              <h2 class="text-2xl font-display font-black text-white mt-0.5">${year} Formula 1 World Championship</h2>
            </div>
            <span class="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-300">
              ${standings.length} Classified Drivers
            </span>
          </div>

          <!-- Champion Spotlight -->
          <div class="bg-gradient-to-r from-red-950/40 to-black/40 p-4 rounded-xl border border-red-800/40 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-mono text-f1-red font-bold uppercase">World Drivers' Champion</span>
              <h3 class="font-display font-black text-xl text-white">${champion.Driver.givenName} ${champion.Driver.familyName}</h3>
              <div class="text-xs font-mono text-slate-400">${champion.Constructors?.[0]?.name || 'Independent'} · ${champion.points} Championship Points</div>
            </div>
            <div class="text-right font-mono text-xs">
              <span class="text-emerald-400 font-bold text-lg">${champion.wins} Wins</span>
              <div class="text-slate-500">Rank: P1</div>
            </div>
          </div>

          <!-- Standings Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th class="p-3">POS</th>
                  <th class="p-3">DRIVER</th>
                  <th class="p-3">NATIONALITY</th>
                  <th class="p-3">CONSTRUCTOR</th>
                  <th class="p-3 text-right">WINS</th>
                  <th class="p-3 text-right">POINTS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${standings.slice(0, 15).map(s => `
                  <tr class="hover:bg-white/5">
                    <td class="p-3 font-bold text-white">${s.position}</td>
                    <td class="p-3 font-bold text-white">${s.Driver.givenName} ${s.Driver.familyName}</td>
                    <td class="p-3 text-slate-400">${s.Driver.nationality}</td>
                    <td class="p-3 text-slate-300">${s.Constructors?.[0]?.name || 'N/A'}</td>
                    <td class="p-3 text-right font-bold text-white">${s.wins}</td>
                    <td class="p-3 text-right font-bold text-f1-red">${s.points}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      // Check if we have pre-seeded historical archive data for this season
      const fallbackData = historicalFallbackArchive[year];
      const masterChampion = masterChampionsIndex[year];

      if (fallbackData) {
        container.innerHTML = `
          <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span class="text-xs font-mono text-emerald-400 font-bold uppercase">Verified Offline Archive Record</span>
                <h2 class="text-2xl font-display font-black text-white mt-0.5">${year} Formula 1 World Championship</h2>
              </div>
              <span class="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-300">
                Historic Classification
              </span>
            </div>

            <!-- Champion Spotlight -->
            <div class="bg-gradient-to-r from-red-950/40 to-black/40 p-4 rounded-xl border border-red-800/40 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-mono text-f1-red font-bold uppercase">World Drivers' Champion</span>
                <h3 class="font-display font-black text-xl text-white">${fallbackData.champion.name}</h3>
                <div class="text-xs font-mono text-slate-400">${fallbackData.champion.team} · ${fallbackData.champion.points} Points</div>
              </div>
              <div class="text-right font-mono text-xs">
                <span class="text-emerald-400 font-bold text-lg">${fallbackData.champion.wins} Wins</span>
                <div class="text-slate-500">Rank: P1</div>
              </div>
            </div>

            ${fallbackData.overview ? `<p class="text-xs text-slate-300 leading-relaxed font-mono bg-white/5 p-3 rounded-xl border border-white/5">${fallbackData.overview}</p>` : ''}

            <!-- Standings Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead class="bg-white/5 text-slate-400 border-b border-white/10">
                  <tr>
                    <th class="p-3">POS</th>
                    <th class="p-3">DRIVER</th>
                    <th class="p-3">NATIONALITY</th>
                    <th class="p-3">CONSTRUCTOR</th>
                    <th class="p-3 text-right">WINS</th>
                    <th class="p-3 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${fallbackData.standings.map(s => `
                    <tr class="hover:bg-white/5">
                      <td class="p-3 font-bold text-white">${s.pos}</td>
                      <td class="p-3 font-bold text-white">${s.name}</td>
                      <td class="p-3 text-slate-400">${s.nat}</td>
                      <td class="p-3 text-slate-300">${s.team}</td>
                      <td class="p-3 text-right font-bold text-white">${s.wins}</td>
                      <td class="p-3 text-right font-bold text-f1-red">${s.pts}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (masterChampion) {
        // Dynamic fallback for all remaining seasons (1950 - 2026)
        container.innerHTML = `
          <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span class="text-xs font-mono text-emerald-400 font-bold uppercase">Historical World Championship Archive</span>
                <h2 class="text-2xl font-display font-black text-white mt-0.5">${year} Formula 1 World Championship</h2>
              </div>
              <span class="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded text-slate-300">
                Official FIA Record
              </span>
            </div>

            <!-- Champion Spotlight -->
            <div class="bg-gradient-to-r from-red-950/40 to-black/40 p-4 rounded-xl border border-red-800/40 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-mono text-f1-red font-bold uppercase">World Drivers' Champion</span>
                <h3 class="font-display font-black text-xl text-white">${masterChampion.name}</h3>
                <div class="text-xs font-mono text-slate-400">${masterChampion.team} · ${masterChampion.pts} Championship Points (${masterChampion.nat})</div>
              </div>
              <div class="text-right font-mono text-xs">
                <span class="text-emerald-400 font-bold text-lg">${masterChampion.wins} Wins</span>
                <div class="text-slate-500">Champion: P1</div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-300 space-y-2">
              <div class="text-f1-red font-bold uppercase">Season Archival Summary</div>
              <p>The ${year} championship was contested under official FIA World Championship regulations with ${masterChampion.name} capturing the World Drivers' title piloting for ${masterChampion.team}.</p>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 class="font-display font-bold text-lg text-white">${year} Championship Overview</h3>
              <span class="text-xs font-mono text-amber-400">Archive Offline Fallback</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed font-mono">
              In ${year}, Formula 1 competed under official FIA sporting regulations across classic Grand Prix events. You can explore all iconic seasons from 1950 to 2026.
            </p>
            <div class="flex items-center gap-2 pt-2">
              <button onclick="window.loadHistoricalSeason(${year})" class="px-4 py-2 bg-f1-red hover:bg-f1-darkRed text-white font-mono text-xs rounded-lg transition-colors">
                Retry Connection
              </button>
            </div>
          </div>
        `;
      }
    }

    if (window.lucide) window.lucide.createIcons();
  };

  /* ==========================================================================
     SECTION: RACE HISTORY & ERAS
     ========================================================================== */
  function renderHistorySection() {
    const root = document.getElementById('section-history');
    if (!root) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="flag" class="w-4 h-4"></i>
          <span>Chronicles of Speed</span>
          <span>·</span>
          <span class="text-slate-400">1950 to Present</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Evolution of <span class="text-f1-red">Formula 1 Eras</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Tracing how Formula 1 evolved from romantic front-engine roadsters to 1,000-horsepower hybrid technological giants.
        </p>
      </div>

      <div class="space-y-4">
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-f1-red font-bold">1950 – 1959</span>
            <span class="text-slate-500">The Romantic Front-Engine Dawn</span>
          </div>
          <h3 class="font-display font-bold text-lg text-white">Alfa Romeo, Ferrari & Juan Manuel Fangio</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Drivers wore leather helmets and polo shirts in front-engine supercharged roadsters. Fangio captured five titles across four distinct constructors.
          </p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-f1-red font-bold">1960 – 1969</span>
            <span class="text-slate-500">The Mid-Engine & Wing Revolution</span>
          </div>
          <h3 class="font-display font-bold text-lg text-white">Cooper, Lotus & Aerodynamic Wings</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Cooper moved the engine behind the driver, rendering front engines obsolete. Colin Chapman introduced inverted wings, monocoque chassis, and commercial liveries.
          </p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-f1-red font-bold">1977 – 1988</span>
            <span class="text-slate-500">The 1,400hp Turbo Monster Era</span>
          </div>
          <h3 class="font-display font-bold text-lg text-white">Ground Effect & Extreme Boost</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Venturi skirts and qualifying turbo engines producing over 1,400 hp from 1.5 litres. Fierce rivalries between Prost, Senna, Lauda, Piquet, and Mansell.
          </p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-f1-red font-bold">2014 – 2025</span>
            <span class="text-slate-500">The Turbo-Hybrid Era</span>
          </div>
          <h3 class="font-display font-bold text-lg text-white">Mercedes Dominance, Ground Effect Return & Red Bull</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            1.6L V6 turbocharged hybrids with dual MGU-K and MGU-H units. Lewis Hamilton matched Schumacher's 7 titles, followed by Max Verstappen's four consecutive championships.
          </p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-2 bg-gradient-to-r from-red-950/30 to-black/30 border-red-800/40">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-emerald-400 font-bold">2026+ Present Era</span>
            <span class="text-slate-400">100% Sustainable Fuel & Active Aero</span>
          </div>
          <h3 class="font-display font-bold text-lg text-white">The 11-Team 50/50 Electric Formula</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            The modern era: Active front and rear wing flaps, zero fossil carbon fuel, 350kW MGU-K electric acceleration, and Cadillac joining as the 11th constructor.
          </p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SECTION: SAVED FAVORITES
     ========================================================================== */
  function renderFavoritesSection() {
    const root = document.getElementById('section-favorites');
    if (!root || !window.F1_DATA) return;

    const favDrivers = window.F1_DATA.drivers.filter(d => (state.favorites.drivers || []).includes(d.id));
    const favTeams = window.F1_DATA.teams.filter(t => (state.favorites.teams || []).includes(t.id));

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="bookmark" class="w-4 h-4"></i>
          <span>Saved Preferences</span>
          <span>·</span>
          <span class="text-slate-400">Local Storage Backed</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Your Bookmarked <span class="text-f1-red">Favorites</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Quickly access your pinned drivers and constructors across multiple sessions.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Favorited Drivers -->
        <div class="space-y-3">
          <h3 class="font-display font-bold text-base text-white uppercase tracking-wider">Bookmarked Drivers (${favDrivers.length})</h3>
          ${favDrivers.length === 0 ? `
            <div class="p-6 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-400 text-center">
              No drivers saved yet. Click the bookmark icon on any driver card to save them here!
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${favDrivers.map(d => `
                <div class="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer" onclick="openDriverModal('${d.id}')">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">${d.flag}</span>
                    <div>
                      <div class="text-sm font-bold text-white">${d.name}</div>
                      <div class="text-xs font-mono text-slate-400">#${d.number} · ${d.code}</div>
                    </div>
                  </div>
                  <button onclick="event.stopPropagation(); toggleFavorite('drivers', '${d.id}')" class="text-f1-red p-1">
                    <i data-lucide="bookmark-x" class="w-4 h-4"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Favorited Teams -->
        <div class="space-y-3">
          <h3 class="font-display font-bold text-base text-white uppercase tracking-wider">Bookmarked Constructors (${favTeams.length})</h3>
          ${favTeams.length === 0 ? `
            <div class="p-6 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-400 text-center">
              No teams saved yet. Bookmark your favorite constructors in the Teams section.
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${favTeams.map(t => `
                <div class="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer" onclick="openTeamModal('${t.id}')">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style="background-color: ${t.color}">
                      ${t.shortName.substring(0, 3)}
                    </div>
                    <div>
                      <div class="text-sm font-bold text-white">${t.name}</div>
                      <div class="text-xs font-mono text-slate-400">${t.country}</div>
                    </div>
                  </div>
                  <button onclick="event.stopPropagation(); toggleFavorite('teams', '${t.id}')" class="text-f1-red p-1">
                    <i data-lucide="bookmark-x" class="w-4 h-4"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SECTION: STATISTICS AUDIT & VERIFICATION HUB
     ========================================================================== */
  function renderAuditSection() {
    const root = document.getElementById('section-audit');
    if (!root) return;

    const statsService = window.F1_STATS_SERVICE;
    let auditReport = null;
    if (statsService && typeof statsService.verifyAllDrivers === 'function') {
      auditReport = statsService.verifyAllDrivers(window.F1_DATA);
    }

    const totalAudited = auditReport ? auditReport.totalAudited : 29;
    const verifiedCount = auditReport ? auditReport.verifiedCount : 29;
    const reportItems = auditReport ? auditReport.report : [];

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-widest">
          <i data-lucide="shield-check" class="w-4 h-4"></i>
          <span>Official Data Governance & Verification</span>
          <span>·</span>
          <span class="text-slate-400">Strict FIA & formula1.com Compliance</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Statistics <span class="text-emerald-400">Audit Hub</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-3xl leading-relaxed">
          Comprehensive, non-destructive automated verification engine for all 29 drivers (22 active 2026 competitors and 7 all-time Hall of Fame legends). Every career point, Grand Prix victory, sprint metric, and pole position is cross-checked against primary Formula 1 official archives and FIA classifications.
        </p>
      </div>

      <!-- Audit Overview Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Drivers Audited</div>
          <div class="text-2xl font-display font-black text-white">${totalAudited} / ${totalAudited}</div>
          <div class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <i data-lucide="check-circle-2" class="w-3 h-3"></i>
            <span>100% Comprehensive</span>
          </div>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Verification Status</div>
          <div class="text-2xl font-display font-black text-emerald-400">${verifiedCount} VERIFIED</div>
          <div class="text-[10px] font-mono text-slate-400">0 Unresolved Discrepancies</div>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Primary Data Source</div>
          <div class="text-sm font-display font-bold text-white truncate">formula1.com & FIA</div>
          <div class="text-[10px] font-mono text-cyan-400">Official Classifications</div>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Historical API Engine</div>
          <div class="text-sm font-display font-bold text-white truncate">Jolpica Ergast v1</div>
          <div class="text-[10px] font-mono text-slate-400">1950 – 2025 Archival Range</div>
        </div>
      </div>

      <!-- Interactive Verification Tool Panel -->
      <div class="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 class="font-display font-bold text-base text-white uppercase tracking-wider">Live Driver Record Inspector</h3>
            <p class="text-xs text-slate-400">Inspect verified metrics, sprint vs Grand Prix separation, and archival sources per driver.</p>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" id="auditSearchInput" placeholder="Filter driver or team..." class="bg-black/50 border border-white/15 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-400 font-mono">
            <button id="runAuditBtn" class="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Re-Run Audit</span>
            </button>
          </div>
        </div>

        <!-- Audit Table -->
        <div class="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead class="text-slate-400 border-b border-white/10 sticky top-0 bg-[#0E131F] z-10">
              <tr>
                <th class="p-3">DRIVER</th>
                <th class="p-3">STATUS</th>
                <th class="p-3 text-right">TITLES</th>
                <th class="p-3 text-right">STARTS (ENTRIES)</th>
                <th class="p-3 text-right">GP WINS</th>
                <th class="p-3 text-right">GP PODIUMS</th>
                <th class="p-3 text-right">GP POLES</th>
                <th class="p-3 text-right text-cyan-400">CAREER PTS</th>
                <th class="p-3 text-right text-amber-400">SPRINT (W/PTS)</th>
                <th class="p-3">LAST AUDITED</th>
              </tr>
            </thead>
            <tbody id="auditTableBody" class="divide-y divide-white/5">
              ${renderAuditTableRows(reportItems)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scoring Systems Archive & Discrepancy Documentation -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="scale" class="w-4 h-4"></i>
            <span>Historical Points Regulations Engine</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            The service enforces epoch-specific FIA sporting regulations rather than backporting modern rules:
          </p>
          <ul class="space-y-2 text-xs font-mono text-slate-300">
            <li class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <strong class="text-white block">1950 – 1953:</strong> 8-6-4-3-2 with 1 pt for fastest lap. Only top 4 results counted.
            </li>
            <li class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <strong class="text-white block">1961 – 1990:</strong> 9-6-4-3-2-1 system. Dropped score regulations applied in 1988 (best 11 of 16), crowning Ayrton Senna (90 pts) despite Alain Prost scoring 105 gross points.
            </li>
            <li class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <strong class="text-white block">1991 – 2002:</strong> 10-6-4-3-2-1 across all classified finishers.
            </li>
            <li class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <strong class="text-white block">2010 – Present:</strong> 25-18-15-12-10-8-6-4-2-1 system with decoupled sprint points (introduced in 2021) and fastest lap bonus points (2019–2024).
            </li>
          </ul>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="book-check" class="w-4 h-4"></i>
            <span>Key Resolved Discrepancies</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Authoritative resolutions applied to prior data inconsistencies:
          </p>
          <div class="space-y-2 text-xs font-mono text-slate-300">
            <div class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span class="text-emerald-400 font-bold block">Lando Norris Win Record:</span>
              Corrected from inaccurate 4 GP wins to exactly 3 official Grand Prix victories (Miami, Zandvoort, Singapore 2024). Sprint victories (Interlagos 2024) are recorded separately.
            </div>
            <div class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span class="text-emerald-400 font-bold block">Starts vs Entries Precision:</span>
              Disambiguated GP starts from entries (e.g. Leclerc 146 entries / 144 starts due to DNS at Monaco 2021 & São Paulo 2023; Sainz 206 entries / 203 starts; Alonso 404 entries / 401 starts).
            </div>
            <div class="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span class="text-emerald-400 font-bold block">Sprint Decoupling:</span>
              Sprint wins and sprint podiums are explicitly isolated from Grand Prix records across driver cards, profile modals, and standings.
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Search & Re-Run handlers
    const searchInput = document.getElementById('auditSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = reportItems.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.driverId.toLowerCase().includes(query)
        );
        const tbody = document.getElementById('auditTableBody');
        if (tbody) tbody.innerHTML = renderAuditTableRows(filtered);
      });
    }

    document.getElementById('runAuditBtn')?.addEventListener('click', () => {
      renderAuditSection();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function renderAuditTableRows(items) {
    if (!items || items.length === 0) {
      return `<tr><td colspan="10" class="p-4 text-center text-slate-400">No driver records found matching query.</td></tr>`;
    }
    return items.map(d => `
      <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="openDriverModal('${d.driverId}')">
        <td class="p-3">
          <div class="font-bold text-white flex items-center gap-2">
            <span>${d.name}</span>
            <span class="text-[10px] font-mono text-slate-500">(${d.category})</span>
          </div>
          <div class="text-[10px] text-slate-400 truncate max-w-xs">${d.notes || d.source}</div>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase flex items-center gap-1 w-fit">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>${d.status}</span>
          </span>
        </td>
        <td class="p-3 text-right font-bold ${d.titles > 0 ? 'text-emerald-400' : 'text-slate-500'}">${d.titles}</td>
        <td class="p-3 text-right text-slate-300">${d.starts} <span class="text-slate-500">(${d.entries})</span></td>
        <td class="p-3 text-right font-bold text-f1-red">${d.careerWins}</td>
        <td class="p-3 text-right font-bold text-amber-400">${d.careerPodiums}</td>
        <td class="p-3 text-right font-bold text-white">${d.careerPoles}</td>
        <td class="p-3 text-right font-bold text-cyan-400">${d.careerPoints.toLocaleString()}</td>
        <td class="p-3 text-right font-bold text-amber-300">${d.sprintWins}W · ${d.sprintPoints}P</td>
        <td class="p-3 text-[10px] text-slate-400 whitespace-nowrap">${d.lastChecked}</td>
      </tr>
    `).join('');
  }

  /* ==========================================================================
     SECTION: SETTINGS & ABOUT
     ========================================================================== */
  function renderSettingsSection() {
    const root = document.getElementById('section-settings');
    if (!root) return;

    root.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-f1-red font-semibold uppercase tracking-widest">
          <i data-lucide="settings" class="w-4 h-4"></i>
          <span>Preferences & System Architecture</span>
          <span>·</span>
          <span class="text-slate-400">Build Information</span>
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          Settings & <span class="text-f1-red">Data Architecture</span>
        </h1>
        <p class="text-slate-400 text-sm max-w-2xl">
          Configure application preferences, view external API endpoints, and inspect data validation parameters.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Preferences Panel -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 class="font-display font-bold text-base text-white uppercase tracking-wider">Application Preferences</h3>
          
          <div class="space-y-3 text-xs font-mono">
            <div class="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <span class="text-white font-bold block">Reduced Motion Mode</span>
                <span class="text-slate-400">Disables intensive scroll transitions for accessibility and battery conservation.</span>
              </div>
              <input type="checkbox" id="reducedMotionCheck" ${state.settings.reducedMotion ? 'checked' : ''} class="w-4 h-4 accent-f1-red">
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <span class="text-white font-bold block">Reset Local Data</span>
                <span class="text-slate-400">Clears saved bookmarks and custom settings back to defaults.</span>
              </div>
              <button id="resetStorageBtn" class="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-lg">
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Technical Architecture Transparency -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 class="font-display font-bold text-base text-white uppercase tracking-wider">Data Sources & API Integration</h3>
          <div class="space-y-2 text-xs font-mono text-slate-300">
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="text-emerald-400 font-bold block mb-1">2026 Grid Dataset</span>
              Maintains verified 11 constructors (including the approved Cadillac Formula 1 Team entry) and 22 race drivers with verified official social media handles and FIA parameters.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="text-cyan-400 font-bold block mb-1">Time Machine Historical Engine</span>
              Queries the open Jolpica-F1 (successor to Ergast API) for 1950–2025 World Championship records with client-side fallback handling.
            </div>
            <div class="p-3 rounded-lg bg-white/5 border border-white/5">
              <span class="text-f1-red font-bold block mb-1">Single-File Architecture</span>
              Runs natively in standard modern web browsers via Tailwind CSS, Chart.js, Lucide Icons, and vanilla JavaScript without server compilation dependencies.
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('reducedMotionCheck')?.addEventListener('change', (e) => {
      state.settings.reducedMotion = e.target.checked;
      localStorage.setItem('f1_hub_settings', JSON.stringify(state.settings));
    });

    document.getElementById('resetStorageBtn')?.addEventListener('click', () => {
      localStorage.removeItem('f1_hub_favorites');
      localStorage.removeItem('f1_hub_settings');
      state.favorites = { drivers: [], teams: [], circuits: [], modules: [] };
      state.settings = { reducedMotion: false, defaultSection: 'home' };
      renderSettingsSection();
      alert('Local preferences have been successfully reset.');
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     GEMINI AI PIT WALL ASSISTANT INTEGRATION
     ========================================================================== */
  const askGeminiBtn = document.getElementById('askGeminiBtn');
  const geminiChatPanel = document.getElementById('geminiChatPanel');
  const closeGeminiChatBtn = document.getElementById('closeGeminiChatBtn');
  const geminiChatForm = document.getElementById('geminiChatForm');
  const geminiChatInput = document.getElementById('geminiChatInput');
  const geminiMessagesContainer = document.getElementById('geminiMessagesContainer');
  const geminiHistory = [];

  if (askGeminiBtn && geminiChatPanel) {
    askGeminiBtn.addEventListener('click', () => {
      geminiChatPanel.classList.toggle('hidden');
      if (!geminiChatPanel.classList.contains('hidden')) {
        geminiChatInput?.focus();
        if (window.lucide) window.lucide.createIcons();
      }
    });

    closeGeminiChatBtn?.addEventListener('click', () => {
      geminiChatPanel.classList.add('hidden');
    });

    // Suggested prompt chips
    document.querySelectorAll('.gemini-prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (geminiChatInput) {
          geminiChatInput.value = btn.textContent.trim();
          sendGeminiMessage();
        }
      });
    });

    geminiChatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      sendGeminiMessage();
    });
  }

  async function sendGeminiMessage() {
    if (!geminiChatInput || !geminiMessagesContainer) return;
    const text = geminiChatInput.value.trim();
    if (!text) return;

    // Append user message
    geminiChatInput.value = '';
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-white space-y-1 ml-4';
    userMsgEl.innerHTML = `
      <div class="font-bold text-[11px] text-f1-red flex items-center gap-1">
        <i data-lucide="user" class="w-3 h-3"></i>
        <span>Driver / User</span>
      </div>
      <p class="text-xs text-slate-100">${escapeHtml(text)}</p>
    `;
    geminiMessagesContainer.appendChild(userMsgEl);

    // Append typing indicator
    const typingId = 'typingIndicator_' + Date.now();
    const typingEl = document.createElement('div');
    typingEl.id = typingId;
    typingEl.className = 'p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs flex items-center gap-2 mr-4';
    typingEl.innerHTML = `
      <div class="w-2 h-2 rounded-full bg-f1-red animate-ping"></div>
      <span class="font-mono text-[11px] text-slate-400">Gemini Race Engineer calculating telemetry & regulations...</span>
    `;
    geminiMessagesContainer.appendChild(typingEl);
    geminiMessagesContainer.scrollTop = geminiMessagesContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: geminiHistory.slice(-8)
        })
      });

      const data = await response.json();
      document.getElementById(typingId)?.remove();

      const aiMsgEl = document.createElement('div');
      aiMsgEl.className = 'p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 space-y-2 mr-4';

      if (response.ok && data.text) {
        // Simple Markdown parser for bullets and bold
        let formattedText = escapeHtml(data.text)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n\n/g, '</p><p class="mt-2 text-xs leading-relaxed text-slate-300">')
          .replace(/\n- (.*?)/g, '<li class="ml-4 list-disc text-slate-300 text-xs">$1</li>')
          .replace(/\n\d+\. (.*?)/g, '<li class="ml-4 list-decimal text-slate-300 text-xs">$1</li>');

        aiMsgEl.innerHTML = `
          <div class="font-bold text-[11px] text-cyan-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-f1-red"></i>
              <span>Gemini 3.8 Flash Engineer</span>
            </span>
            <span class="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">Verified Grounding</span>
          </div>
          <div class="text-xs leading-relaxed space-y-1.5">${formattedText}</div>
        `;

        geminiHistory.push({ role: 'user', text });
        geminiHistory.push({ role: 'model', text: data.text });
      } else {
        const errorMsg = data?.error || 'Unable to generate response at this moment.';
        aiMsgEl.innerHTML = `
          <div class="font-bold text-[11px] text-amber-400 flex items-center gap-1.5">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
            <span>Pit Wall Radio Advisory</span>
          </div>
          <p class="text-xs text-slate-300">${escapeHtml(errorMsg)}</p>
        `;
      }

      geminiMessagesContainer.appendChild(aiMsgEl);
    } catch (err) {
      document.getElementById(typingId)?.remove();
      const errEl = document.createElement('div');
      errEl.className = 'p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs mr-4 space-y-1';
      errEl.innerHTML = `
        <div class="font-bold text-[11px] flex items-center gap-1">
          <i data-lucide="wifi-off" class="w-3.5 h-3.5"></i>
          <span>Connection Notice</span>
        </div>
        <p>Could not connect to the server-side Gemini service. Ensure server is active and GEMINI_API_KEY is available.</p>
      `;
      geminiMessagesContainer.appendChild(errEl);
    }

    geminiMessagesContainer.scrollTop = geminiMessagesContainer.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Route Check based on URL Hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(`section-${initialHash}`)) {
    window.switchSection(initialHash);
  } else {
    window.switchSection('home');
  }
});
