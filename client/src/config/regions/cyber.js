export const CYBER_REGIONS = [
  {
    id: 'cyber_russia',
    name: 'RU',
    fullName: 'Russia',
    lat: 55.7558,
    lon: 37.6173,
    group: 'APT28 / APT29',
    aka: 'Fancy Bear / Cozy Bear',
    sponsor: 'GRU / SVR',
    desc: 'State-sponsored groups linked to Russian intelligence. Active in espionage, disinformation, and disruptive operations supporting geopolitical objectives, including Ukraine-related activities.',
    targets: ['Government', 'Defense', 'Critical Infrastructure', 'Elections', 'Ukraine/NATO Allies']
  },
  {
    id: 'cyber_china',
    name: 'CN',
    fullName: 'China',
    lat: 39.9042,
    lon: 116.4074,
    group: 'APT41 / Salt Typhoon / Volt Typhoon',
    aka: 'Winnti / Operator Panda',
    sponsor: 'MSS / PLA',
    desc: 'Prolific state-sponsored actors conducting global espionage, supply chain compromises, and pre-positioning in critical infrastructure. Surge in telecom and infrastructure targeting observed in 2025.',
    targets: ['Telecom', 'Critical Infrastructure', 'Tech', 'Government', 'Aerospace']
  },
  {
    id: 'cyber_nk',
    name: 'NK',
    fullName: 'North Korea',
    lat: 39.0392,
    lon: 125.7625,
    group: 'Lazarus / Kimsuky',
    aka: 'Famous Chollima / Velvet Chollima / APT43',
    sponsor: 'Reconnaissance General Bureau (RGB)',
    desc: 'Hybrid operations blending espionage with financially motivated attacks, including record cryptocurrency thefts and ransomware to fund regime. Increasing use of AI and collaboration with other actors.',
    targets: ['Cryptocurrency', 'Finance', 'Defense', 'Supply Chain', 'Think Tanks']
  },
  {
    id: 'cyber_iran',
    name: 'IR',
    fullName: 'Iran',
    lat: 35.6892,
    lon: 51.3890,
    group: 'MuddyWater / Charming Kitten',
    aka: 'APT33/35 / UNC1549',
    sponsor: 'IRGC / MOIS',
    desc: 'Adaptive operations focusing on regional adversaries, disruptive wiper attacks, and espionage. Increased sophistication and targeting of aerospace, defense, and critical sectors amid geopolitical tensions.',
    targets: ['Israel', 'Energy', 'Aerospace', 'Government', 'Dissidents']
  }
]
