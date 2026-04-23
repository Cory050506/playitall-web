import type { CSSProperties, ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  alt: string;
  fill?: boolean;
  unoptimized?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function NextImage({
  fill,
  style,
  className,
  sizes: _sizes,
  unoptimized: _unoptimized,
  priority: _priority,
  ...props
}: ImageProps) {
  const mergedStyle: CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }
    : style ?? {};

  return <img {...props} className={className} style={mergedStyle} />;
}
