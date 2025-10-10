import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  label: string;
  currentImage?: string;
  onImageChange: (image: string | undefined) => void;
  circular?: boolean;
}

export function ImageUpload({ label, currentImage, onImageChange, circular }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (limite: 500KB para evitar quota exceeded)
    const maxSizeKB = 500;
    const fileSizeKB = file.size / 1024;
    
    if (fileSizeKB > maxSizeKB) {
      alert(`Imagem muito grande (${fileSizeKB.toFixed(0)}KB). O limite é ${maxSizeKB}KB. Por favor, use uma imagem menor ou comprima-a antes de fazer upload.`);
      e.target.value = ''; // Limpar input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // Criar uma imagem para redimensionar se necessário
      const img = new Image();
      img.onload = () => {
        // Se a imagem for muito grande, redimensionar
        const maxWidth = 800;
        const maxHeight = 800;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height / width) * maxWidth;
            width = maxWidth;
          } else {
            width = (width / height) * maxHeight;
            height = maxHeight;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Comprimir para JPEG com qualidade 0.8
          const compressedData = canvas.toDataURL('image/jpeg', 0.8);
          onImageChange(compressedData);
        } else {
          onImageChange(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 space-y-3">
        {currentImage && (
          <div className="relative inline-block">
            <img 
              src={currentImage} 
              alt="Preview" 
              className={`w-32 h-32 object-cover border-2 border-border ${circular ? 'rounded-full' : 'rounded-lg'}`}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => onImageChange(undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {currentImage ? 'Alterar Imagem' : 'Fazer Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
