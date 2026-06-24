import Clock from './Clock'

export default {
  title: 'Navigation/Clock',
  component: Clock,
  decorators: [
    (Story) => (
      <div className="bg-bg-dark p-4 rounded">
        <Story />
      </div>
    ),
  ],
}

export const Default = {}
