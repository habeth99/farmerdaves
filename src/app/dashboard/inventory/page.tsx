import { getAllItemsServerSide } from '../../../utils/itemService-server';
import InventoryMain from './InventoryMain';

export default async function Inventory() {
  // Fetch data on the server
  let items = [];
  let error = null;
  
  try {
    items = await getAllItemsServerSide();
  } catch (err) {
    console.error('Failed to fetch items server-side:', err);
    error = 'Failed to load inventory items';
  }

  return <InventoryMain initialItems={items} initialError={error} />;
}