import PanelFeedItem from './PanelFeedItem'

const SAMPLE_ITEM = {
  title: 'Anthropic announces $5B Series F at $200B valuation',
  link: 'https://example.com/anthropic-raises',
  source: 'TechCrunch',
  date: new Date(),
}

export default {
  title: 'Dashboard/PanelFeedItem',
  component: PanelFeedItem,
  argTypes: {
    accent: {
      control: { type: 'select' },
      options: ['green', 'purple', 'red', 'blue', 'amber', 'cyan'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96 bg-bg-panel p-4 rounded">
        <Story />
      </div>
    ),
  ],
}

export const Green = {
  args: { item: SAMPLE_ITEM, accent: 'green' },
}
export const Purple = {
  args: { item: { ...SAMPLE_ITEM, source: 'StrictlyVC', title: 'Lightspeed closes $4B growth fund' }, accent: 'purple' },
}
export const Red = {
  args: { item: { ...SAMPLE_ITEM, source: 'Google News', title: 'Meta announces 10,000 layoffs' }, accent: 'red' },
}
