import Panel from './Panel'

export default {
  title: 'Dashboard/Panel',
  component: Panel,
  argTypes: {
    id: { control: 'text' },
    title: { control: 'text' },
    isWide: { control: 'boolean' },
    draggable: { control: 'boolean' },
  },
}

export const Default = {
  args: {
    id: 'tech',
    title: 'Tech News',
    children: (
      <div className="p-4 space-y-3">
        <p className="text-[0.85rem]">Sample panel content goes here.</p>
        <p className="text-[0.85rem] text-text-secondary">More text in the dimmer color.</p>
      </div>
    ),
  },
}

export const Draggable = {
  args: {
    ...Default.args,
    draggable: true,
  },
}

export const Wide = {
  args: {
    ...Default.args,
    title: 'Wide Panel',
    isWide: true,
    children: <div className="p-4">Spans 2 columns.</div>,
  },
}
