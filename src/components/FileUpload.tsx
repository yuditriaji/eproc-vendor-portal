'use client';

import { useRef, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeFileName } from '@/utils/sanitizers';

// Register FilePond plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

interface FileUploadProps {
  maxFiles?: number;
  maxFileSize?: string;
  acceptedFileTypes?: string[];
  onUpdateFiles?: (files: any[]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

interface FilePreview {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string | undefined;
}

export default function FileUpload({
  maxFiles = 5,
  maxFileSize = '10MB',
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
  onUpdateFiles,
  disabled = false,
  className = '',
  label,
  hint,
  error,
  required = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const pondRef = useRef<FilePond>(null);

  const handleUpdateFiles = (fileItems: any[]) => {
    setFiles(fileItems);
    onUpdateFiles?.(fileItems.map((item: any) => item.file));

    // Generate previews
    const newPreviews: FilePreview[] = fileItems.map((fileItem) => {
      const file = fileItem.file as globalThis.File;
      return {
        id: fileItem.id || Date.now().toString(),
        name: sanitizeFileName(file.name),
        size: file.size,
        type: file.type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };
    });
    setPreviews(newPreviews);
  };

  const handleRemoveFile = (fileId: string) => {
    if (pondRef.current) {
      pondRef.current.removeFile(fileId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <FilePond
          ref={pondRef}
          files={files}
          onupdatefiles={handleUpdateFiles}
          allowMultiple={maxFiles > 1}
          maxFiles={maxFiles}
          maxFileSize={maxFileSize}
          acceptedFileTypes={acceptedFileTypes}
          labelIdle={`
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <div class="mb-4">
                <div class="w-12 h-12 mx-auto bg-gray-400 rounded"></div>
              </div>
              <div class="text-lg font-medium text-gray-900 mb-2">
                Drop files here or <span class="text-primary-600 underline">browse</span>
              </div>
              <div class="text-sm text-gray-500">
                Upload up to ${maxFiles} file${maxFiles > 1 ? 's' : ''} (Max ${maxFileSize} each)
              </div>
            </div>
          `}
          className="file-upload-pond"
          credits={false}
          beforeDropFile={() => {
            return true;
          }}
          stylePanelLayout="compact"
          styleButtonRemoveItemPosition="right"
          styleLoadIndicatorPosition="center bottom"
          styleProgressIndicatorPosition="center bottom"
          styleButtonProcessItemPosition="right"
        />

        {/* Custom file previews */}
        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 space-y-2"
            >
              {previews.map((preview, index) => (
                <motion.div
                  key={preview.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className="file-preview group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {preview.url ? (
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-gray-400 rounded" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {preview.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(preview.size)}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(preview.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <div className="w-5 h-5 bg-red-500 rounded" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm text-red-600 flex items-center space-x-1"
        >
          <div className="w-4 h-4 bg-red-600 rounded" />
          <span>{error}</span>
        </motion.p>
      )}

      <style jsx>{`
        :global(.file-upload-pond .filepond--drop-label) {
          cursor: pointer !important;
        }

        :global(.file-upload-pond .filepond--panel-root) {
          border: 2px dashed #d1d5db !important;
          border-radius: 1rem !important;
          background: transparent !important;
          transition: all 0.2s ease !important;
        }

        :global(.file-upload-pond .filepond--panel-root:hover) {
          border-color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.05) !important;
        }

        :global(.file-upload-pond .filepond--panel-root.filepond--hopper) {
          border-color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }

        :global(.file-upload-pond .filepond--item) {
          margin: 0.5rem !important;
        }

        :global(.file-upload-pond .filepond--item-panel) {
          border-radius: 0.75rem !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(10px) !important;
        }
      `}</style>
    </div>
  );
}