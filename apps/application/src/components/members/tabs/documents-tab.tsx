'use client';

import { useState, useCallback, useRef } from 'react';
import {
  cn,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
} from '@clubvantage/ui';
import {
  useGetMemberDocumentsQuery,
  useUploadMemberDocumentMutation,
  useDeleteMemberDocumentMutation,
  useVerifyDocumentMutation,
  useGetDocumentSignedUrlQuery,
  DocumentType,
  GetMemberDocumentsQuery,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Plus,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Clock,
  FileCheck,
  FileImage,
  FileScan,
  FileWarning,
  FileSignature,
  CalendarDays,
  X,
} from 'lucide-react';

// Type for a single document from the query
type MemberDocument = NonNullable<
  GetMemberDocumentsQuery['memberDocuments']['edges'][number]['node']
>;

export interface DocumentsTabProps {
  memberId: string;
}

// Document type display configuration
const documentTypeConfig: Record<
  DocumentType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CONTRACT: {
    label: 'Contract',
    icon: FileSignature,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ID_DOCUMENT: {
    label: 'ID Document',
    icon: FileScan,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  PROOF_OF_ADDRESS: {
    label: 'Proof of Address',
    icon: FileText,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  MEDICAL_CERT: {
    label: 'Medical Certificate',
    icon: FileCheck,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  WAIVER: {
    label: 'Waiver',
    icon: FileWarning,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  PHOTO: {
    label: 'Photo',
    icon: FileImage,
    color: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  OTHER: {
    label: 'Other',
    icon: FileText,
    color: 'bg-stone-50 text-stone-700 border-stone-200',
  },
};

// Helper to format file size
function formatFileSize(bytes?: number | null): string {
  if (!bytes) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Helper to format date
function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Check if document is expiring soon (within 30 days)
function isExpiringSoon(expiryDate?: string | null): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiry > now && expiry <= thirtyDaysFromNow;
}

// Check if document is expired
function isExpired(expiryDate?: string | null): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  return expiry < new Date();
}

// Document Card Component
function DocumentCard({
  document,
  onPreview,
  onDownload,
  onDelete,
  onVerify,
}: {
  document: MemberDocument;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onVerify: (isVerified: boolean) => void;
}) {
  const config = documentTypeConfig[document.type];
  const Icon = config.icon;
  const expired = isExpired(document.expiryDate);
  const expiringSoon = isExpiringSoon(document.expiryDate);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative">
        {/* Header with icon and actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner',
                config.color.split(' ')[0]
              )}
            >
              <Icon className={cn('h-6 w-6', config.color.split(' ')[1])} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                {document.name}
              </h3>
              <Badge
                className={cn(
                  'mt-1 text-[10px] font-medium',
                  config.color
                )}
              >
                {config.label}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {document.isVerified ? (
                <DropdownMenuItem onClick={() => onVerify(false)}>
                  <ShieldX className="mr-2 h-4 w-4" />
                  Remove Verification
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onVerify(true)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Document
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Document details */}
        <div className="mt-3 space-y-1.5">
          <p className="truncate text-xs text-muted-foreground">
            {document.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(document.fileSize)}
          </p>
          {document.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {document.description}
            </p>
          )}
        </div>

        {/* Footer with badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Verification badge */}
          {document.isVerified ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-medium">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge className="bg-stone-50 text-stone-500 border-stone-200/60 text-[10px] font-medium">
              <Shield className="mr-1 h-3 w-3" />
              Unverified
            </Badge>
          )}

          {/* Expiry badge */}
          {document.expiryDate && (
            <>
              {expired ? (
                <Badge className="bg-red-50 text-red-700 border-red-200/60 text-[10px] font-medium">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Expired
                </Badge>
              ) : expiringSoon ? (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200/60 text-[10px] font-medium">
                  <Clock className="mr-1 h-3 w-3" />
                  Expires {formatDate(document.expiryDate)}
                </Badge>
              ) : (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200/60 text-[10px] font-medium">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  Exp: {formatDate(document.expiryDate)}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Upload date */}
        <p className="mt-2 text-[10px] text-muted-foreground">
          Uploaded {formatDate(document.createdAt)}
        </p>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadDocumentModal({
  open,
  onOpenChange,
  memberId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  onSuccess: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<DocumentType>('OTHER');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMemberDocumentMutation();

  const resetForm = useCallback(() => {
    setFile(null);
    setName('');
    setType('OTHER');
    setDescription('');
    setExpiryDate('');
    setError(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) {
        setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [name]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        if (!name) {
          setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
      }
    },
    [name]
  );

  const handleSubmit = async () => {
    if (!file || !name || !type) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);

    try {
      // For now, we simulate a file URL since actual file upload would require S3 integration
      // In production, you would:
      // 1. Get a pre-signed URL from the backend
      // 2. Upload the file to S3
      // 3. Then call the mutation with the S3 URL
      const mockFileUrl = `https://storage.clubvantage.com/documents/${memberId}/${Date.now()}-${file.name}`;

      const result = await uploadMutation.mutateAsync({
        input: {
          memberId,
          name,
          type,
          fileName: file.name,
          fileUrl: mockFileUrl,
          fileSize: file.size,
          mimeType: file.type,
          description: description || undefined,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        },
      });

      if (result.uploadMemberDocument.success) {
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        setError(result.uploadMemberDocument.message || 'Failed to upload document');
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document for this member. Supported formats: PDF, images, and common document types.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Drag and drop zone */}
          <div
            className={cn(
              'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
              isDragging
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-10 w-10 text-emerald-600" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="mt-1"
                >
                  <X className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, JPG up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
              </>
            )}
          </div>

          {/* Document name */}
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name *</Label>
            <Input
              id="doc-name"
              placeholder="e.g., Membership Contract 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Document type */}
          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(documentTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="doc-description">Description</Label>
            <Input
              id="doc-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Expiry date */}
          <div className="space-y-2">
            <Label htmlFor="doc-expiry">Expiry Date</Label>
            <Input
              id="doc-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !name || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Modal
function DeleteConfirmationModal({
  open,
  onOpenChange,
  document,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: MemberDocument | null;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{document.name}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Preview Modal Component
function PreviewModal({
  open,
  onOpenChange,
  document,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: MemberDocument | null;
}) {
  const { data: signedUrlData } = useGetDocumentSignedUrlQuery(
    { id: document?.id || '', expiresIn: 3600 },
    { enabled: open && !!document?.id }
  );

  if (!document) return null;

  const isImage = document.mimeType?.startsWith('image/');
  const isPdf = document.mimeType === 'application/pdf';
  const signedUrl = signedUrlData?.documentSignedUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{document.name}</DialogTitle>
          <DialogDescription>
            {document.fileName} - {formatFileSize(document.fileSize)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center min-h-[400px] bg-slate-100 rounded-lg">
          {!signedUrl ? (
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p>Loading preview...</p>
            </div>
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedUrl}
              alt={document.name}
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={signedUrl}
              className="w-full h-[60vh]"
              title={document.name}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p>Preview not available for this file type</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.open(signedUrl, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download to View
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Documents Tab Component
export function DocumentsTab({ memberId }: DocumentsTabProps) {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MemberDocument | null>(null);
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'ALL'>('ALL');

  const { data, isLoading, error, refetch } = useGetMemberDocumentsQuery({
    memberId,
    first: 50,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    includeExpired: true,
  });

  const deleteMutation = useDeleteMemberDocumentMutation();
  const verifyMutation = useVerifyDocumentMutation();

  const documents = data?.memberDocuments?.edges?.map((e) => e.node) || [];
  const totalCount = data?.memberDocuments?.totalCount || 0;

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      await deleteMutation.mutateAsync({ id: selectedDocument.id });
      setDeleteModalOpen(false);
      setSelectedDocument(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleVerify = async (document: MemberDocument, isVerified: boolean) => {
    try {
      await verifyMutation.mutateAsync({
        input: {
          documentId: document.id,
          isVerified,
        },
      });
      refetch();
    } catch (err) {
      console.error('Failed to update verification:', err);
    }
  };

  const handleDownload = async (document: MemberDocument) => {
    // In production, you would get a signed URL and trigger download
    // For now, we'll just open the file URL
    window.open(document.fileUrl, '_blank');
  };

  const handlePreview = (document: MemberDocument) => {
    setSelectedDocument(document);
    setPreviewModalOpen(true);
  };

  const handleOpenDeleteModal = (document: MemberDocument) => {
    setSelectedDocument(document);
    setDeleteModalOpen(true);
  };

  // Count documents with expiry warnings
  const expiringCount = documents.filter((d) => isExpiringSoon(d.expiryDate)).length;
  const expiredCount = documents.filter((d) => isExpired(d.expiryDate)).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-200/60 bg-red-50/80 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Documents</h3>
            <p className="text-sm text-red-700">
              {(error as Error).message || 'An error occurred while loading documents'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with filters and upload button */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Documents
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalCount} document{totalCount !== 1 ? 's' : ''} on file
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as DocumentType | 'ALL')}
            >
              <SelectTrigger className="w-[180px] bg-white/80">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {Object.entries(documentTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Upload button */}
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="shadow-md"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Expiry warnings */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <Alert variant="destructive" className="flex-1 min-w-[200px]">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {expiredCount} document{expiredCount !== 1 ? 's have' : ' has'} expired
              </AlertDescription>
            </Alert>
          )}
          {expiringCount > 0 && (
            <Alert variant="warning" className="flex-1 min-w-[200px]">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {expiringCount} document{expiringCount !== 1 ? 's' : ''} expiring soon
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Document grid */}
      {documents.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-muted/50 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No Documents
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Upload contracts, ID documents, waivers, and other important files for this member.
            </p>
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="mt-6 shadow-md"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload First Document
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onPreview={() => handlePreview(document)}
              onDownload={() => handleDownload(document)}
              onDelete={() => handleOpenDeleteModal(document)}
              onVerify={(isVerified) => handleVerify(document, isVerified)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        memberId={memberId}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['GetMemberDocuments'] });
        }}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        document={selectedDocument}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <PreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        document={selectedDocument}
      />
    </div>
  );
}
