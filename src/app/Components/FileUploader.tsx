import React, { useState, useCallback } from "react";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
      setFileNames(Array.from(event.target.files).map((file) => file.name));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      onFilesSelected(event.dataTransfer.files);
      setFileNames(Array.from(event.dataTransfer.files).map((file) => file.name));
    }
  };

  return (
    <div
      className={`p-4 border-2 border-dashed rounded-lg ${isDragging ? "border-blue-500" : "border-gray-300"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Upload Files
      </label>
      <p className="mt-2 text-sm text-gray-700">or drag and drop files here</p>
      <ul className="mt-2">
        {fileNames.map((name, index) => (
          <li key={index} className="text-sm text-gray-700">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploader;