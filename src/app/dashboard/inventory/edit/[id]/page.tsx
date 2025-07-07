import { getItemByIdServerSide } from '../../../../../utils/itemService-server';
import EditItemMain from './Main';
import { notFound } from 'next/navigation';

interface EditItemPageProps {
  params: {
    id: string;
  };
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  // Fetch data on the server
  const item = await getItemByIdServerSide(params.id);
  
  if (!item) {
    notFound(); // This will show a 404 page
  }

  return <EditItemMain itemId={params.id} initialItem={item} />;
} 