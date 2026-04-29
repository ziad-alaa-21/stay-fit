import React from "react";
import { Product } from "../../types";

interface ProductThumbProps {
  product: Product;
}

export const ProductThumb = React.memo(function ProductThumb({ product }: ProductThumbProps) {
  if (product.image) {
    return (
      <img 
        src={product.image} 
        alt="" 
        className="h-14 w-14 rounded object-cover" 
      />
    );
  }
  
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded bg-gradient-to-br from-stay-red/70 to-stay-elevated font-display text-lg">
      {product.category.slice(0, 2).toUpperCase()}
    </div>
  );
});
