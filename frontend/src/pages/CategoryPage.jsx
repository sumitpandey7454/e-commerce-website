import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import ProductListing from './ProductListing';
import { CATEGORIES } from '../utils/constants';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const cat = CATEGORIES.find(c => c.id === categoryId);

  useEffect(() => {
    if (cat) document.title = `${cat.label} — ShopVerse`;
    return () => { document.title = 'ShopVerse'; };
  }, [cat]);

  return <ProductListing forcedCategory={categoryId} />;
}