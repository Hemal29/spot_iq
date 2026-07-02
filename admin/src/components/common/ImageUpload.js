import React, { useState, useRef, useCallback } from 'react';
import { FaCloudUploadAlt, FaTimes, FaSpinner } from 'react-icons/fa';

const ImageUpload = ({ images = [], onUpload, onRemove, multiple = true, maxFiles = 10 }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = useCallback(
    async (files) => {
      const fileList = Array.from(files);
      if (!multiple) {
        const file = fileList[0];
        if (onUpload) {
          setUploading(true);
          await onUpload(file);
          setUploading(false);
        }
        return;
      }
      if (onUpload) {
        setUploading(true);
        await onUpload(fileList);
        setUploading(false);
      }
    },
    [multiple, onUpload]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleClick = () => fileRef.current?.click();

  const handleChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <FaSpinner className="text-3xl text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FaCloudUploadAlt className="text-4xl text-gray-400" />
            <p className="text-sm font-medium text-gray-600">
              Drag & drop images here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                alt={`Upload ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => onRemove && onRemove(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
