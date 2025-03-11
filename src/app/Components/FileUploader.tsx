import React, { useState } from "react";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(newFiles);
      onFilesSelected(event.target.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      setFiles(newFiles);
      onFilesSelected(event.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesSelected(new DataTransfer().files); // Update the parent component with the new files list
  };

  return (
    <div className="flex flex-col">
      <input
        className="hidden"
        onDragLeave={handleDragLeave}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className={`flex justify-center items-center h-[65px] p-4 w-[520px] border-2 text-white border-dashed rounded-lg ${isDragging ? "border-blue-500" : "border-gray-700"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        Upload Files
      </label>
      <ul className={`absolute -top-11 w-auto flex justify-center bg-gray-500 p-2 rounded-lg ${files.length === 0 ? "hidden" : ""}`}>
        {files.map((file, index) => (
          <li key={index} className="text-sm text-gray-200 flex items-center">
            {file.name}
            <button
              className="ml-4 text-red-500"
              onClick={() => handleRemoveFile(index)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploader;