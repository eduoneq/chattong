import type { CSSProperties } from "react";

type Props = {
  src: string;
  mono?: boolean;
  tint?: string;
  alt?: string;
  className?: string;
};

/** Color logos stay as images. Mono marks are CSS masks so they follow the theme. */
export function BrandIcon({ src, mono, tint, alt = "", className }: Props) {
  if (mono) {
    const style = {
      "--mask": `url("${src}")`,
      color: tint,
    } as CSSProperties;
    return (
      <span
        className={className ? `glyph ${className}` : "glyph"}
        style={style}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      />
    );
  }
  return <img src={src} alt={alt} className={className} draggable={false} />;
}

export function msgIconSrc(id: string) {
  return `/icons/msg/${id}.svg`;
}

export function aiIconSrc(id: string) {
  return `/icons/ai/${id}.svg`;
}
