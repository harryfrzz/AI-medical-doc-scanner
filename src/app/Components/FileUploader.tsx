import React, { useState } from "react";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
      setFileNames(Array.from(event.target.files).map((file) => file.name));
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
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
