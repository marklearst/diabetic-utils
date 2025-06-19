/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro', 'installation', 'quick-start'],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/glucose-calculations',
        'guides/time-in-range',
        'guides/a1c-estimations',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/modules',
        {
          type: 'category',
          label: 'Functions',
          items: [
            'api/functions/calculateA1C',
            'api/functions/calculateGlucoseStats',
            'api/functions/calculateTimeInRange',
            'api/functions/convertGlucose',
            'api/functions/formatGlucose',
          ],
        },
        {
          type: 'category',
          label: 'Interfaces',
          items: [
            'api/interfaces/A1CReading',
            'api/interfaces/GlucoseReading',
            'api/interfaces/GlucoseStats',
            'api/interfaces/GlucoseStatsOptions',
            'api/interfaces/TIROptions',
            'api/interfaces/TimeInRangeResult',
          ],
        },
      ],
    },
  ],
}

module.exports = sidebars
