/**
 * Img — an <img> that transparently swaps to a fallback source when the
 * primary file is missing. Lets us ship local hand-picked photos while the
 * generated placeholder keeps the layout intact until they are added.
 */

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { IMAGE_FALLBACK } from '../lib/media';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallback?: string;
}

export function Img({ src, fallback, alt = '', ...rest }: Props) {
  const resolved = fallback ?? IMAGE_FALLBACK[src];
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <img
      src={current}
      alt={alt}
      {...rest}
      onError={() => {
        if (resolved && current !== resolved) setCurrent(resolved);
      }}
    />
  );
}
