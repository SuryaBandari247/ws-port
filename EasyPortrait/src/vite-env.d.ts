declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module 'react-easy-crop' {
  export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface CropperProps {
    image: string;
    crop: Point;
    zoom: number;
    aspect?: number;
    cropShape?: 'rect' | 'round';
    showGrid?: boolean;
    onCropChange: (crop: Point) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    onZoomChange: (zoom: number) => void;
    classes?: {
      containerClassName?: string;
      mediaClassName?: string;
    };
  }

  const ReactEasyCrop: React.ComponentType<CropperProps>;
  export default ReactEasyCrop;
}
