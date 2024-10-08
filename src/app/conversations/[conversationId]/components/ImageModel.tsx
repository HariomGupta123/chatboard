"use client"

import Model from "@/Components/Model";
import Image from "next/image";

interface ImageModelProps{
    isOpen?:boolean;
    onClose:()=>void;
    src?:string|null;
}
const ImageModel:React.FC<ImageModelProps> = ({isOpen,onClose,src}) => {
    if(!src){
        return null;
    }
  return (
  <Model isOpen={isOpen} onClose={onClose}>
    <div className="w-80 h-80">
        <Image
        alt="Image"
        className="object-cover"
        fill
        src={src}
        />

    </div>

  </Model>
  )
}

export default ImageModel
