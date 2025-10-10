import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, Trash2, Download, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document as DocumentType } from "@shared/schema";

interface DocumentsTabProps {
  artistId: string;
  documents?: DocumentType[];
  isLoading: boolean;
}

const documentTypes = [
  { value: "cv", label: "CV" },
  { value: "portfolio", label: "Portfolio" },
  { value: "grant_draft", label: "Demande de subvention" },
  { value: "budget", label: "Budget" },
  { value: "proposal", label: "Proposition de projet" },
  { value: "contract", label: "Contrat" },
  { value: "other", label: "Autre" },
];

export function DocumentsTab({ artistId, documents, isLoading }: DocumentsTabProps) {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: { title: string; type: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      formData.append("type", data.type);
      formData.append("artistId", artistId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Échec du téléversement");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/artists`, artistId, "documents"] });
      toast({
        title: "Document ajouté",
        description: "Le document a été téléversé avec succès.",
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocTitle("");
      setDocType("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléversement.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      return await apiRequest("DELETE", `/api/documents/${docId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/documents`] });
      queryClient.invalidateQueries({ queryKey: [`/api/artists`, artistId, "documents"] });
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!docTitle) {
        setDocTitle(e.target.files[0].name);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !docTitle || !docType) {
      toast({
        title: "Champs manquants",
        description: "Veuillez sélectionner un fichier, entrer un titre et choisir un type.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ title: docTitle, type: docType, file: selectedFile });
  };

  const handleDownload = (doc: DocumentType) => {
    window.open(doc.fileUrl, "_blank");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-document">
              <Upload className="h-4 w-4 mr-2" />
              Téléverser un Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Fichier *</Label>
                <div className="mt-2">
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    data-testid="input-document-file"
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Fichier sélectionné: {selectedFile.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="doc-title">Titre du Document *</Label>
                <Input
                  id="doc-title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="ex: CV actualisé 2024"
                  data-testid="input-document-title"
                />
              </div>
              <div>
                <Label htmlFor="doc-type">Type de Document *</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger data-testid="select-document-type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  data-testid="button-cancel-upload"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  data-testid="button-submit-upload"
                >
                  {uploadMutation.isPending ? "Téléversement..." : "Téléverser"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} data-testid={`document-${doc.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {documentTypes.find((t) => t.value === doc.type)?.label || doc.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      data-testid={`button-download-${doc.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <File className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun document téléversé
              </p>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(true)}
                data-testid="button-upload-first-document"
              >
                <Upload className="h-4 w-4 mr-2" />
                Téléverser le Premier Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
