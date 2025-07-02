import EditItemMain from './Main';

interface EditItemPageProps {
  params: {
    id: string;
  };
}

export default function EditItemPage({ params }: EditItemPageProps) {
  return <EditItemMain itemId={params.id} />;
} 