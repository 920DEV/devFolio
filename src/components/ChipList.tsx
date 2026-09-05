type ChipListProps = {
  items: string[];
};

export function ChipList({ items }: ChipListProps) {
  return (
    <div className="chip-row">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}
