import InventoryDetailsMain from './Main';

interface InventoryDetailsPageProps {
  params: {
    id: string;
  };
}

export default function InventoryDetailsPage({ params }: InventoryDetailsPageProps) {
  return <InventoryDetailsMain itemId={params.id} />;
}