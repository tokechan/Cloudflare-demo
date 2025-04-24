"use client";

import React,{ useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

type UploadResult = {
  success: boolean;
  message?: string;
  url?: string;
  expiresAt?: number;
};


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] =useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  }, []);

  const handleUpload = async () => {
    if(!file) return;

    setUploading(true);

    try{
      const formData = new FormData();
      formData.append("file", file);
      formData.append("expiration", "7");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = (await response.json()) as UploadResult;
      setUploadResult(result);

      if(result.success ) {
        setFile(null);
        setFileName("");
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message:
          error instanceof Error ? error.message : "occurred while uploading",
      });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-4xl font-bold md-4">File share App</h1>

      <div 
      {...getRootProps()}
      className={`border-2 border-dashe rounded-lg p-8 mb-4 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-blue-500 bg-bule-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
      }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center h-32">
          <p className="text-gray-600">
            {file ? fileName : "Here you can upload your file"}  
          </p>
        </div>
      </div>

      {file && (
        <div>
          <p>File name: {fileName}</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {uploadResult && uploadResult.success && uploadResult.url && (
        <div>
          <h3>Share link:URL</h3>
          <input 
          type="text"
          readOnly 
          value={uploadResult.url}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button onClick={() => navigator.clipboard.writeText(uploadResult.url!)}>
            Copy
          </button>

          {uploadResult.expiresAt && (
            <p>
              This link will expire in {new Date(uploadResult.expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
