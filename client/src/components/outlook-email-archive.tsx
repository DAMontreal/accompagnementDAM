import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Archive, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface OutlookEmail {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  bodyPreview: string;
}

interface OutlookEmailArchiveProps {
  artistId: string;
  artistEmail: string;
}

export function OutlookEmailArchive({ artistId, artistEmail }: OutlookEmailArchiveProps) {
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch emails for this artist's email address
  const { data: emails, isLoading } = useQuery<OutlookEmail[]>({
    queryKey: [`/api/outlook/emails/search?email=${artistEmail}`],
    enabled: !!artistEmail,
  });

  // Archive email mutation
  const archiveMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/outlook/emails/${messageId}/archive`, {
        method: "POST",
        body: JSON.stringify({ artistId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to archive email");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists", artistId, "interactions"] });
      toast({
        title: "Email archivé",
        description: "L'email a été ajouté à l'historique d'interactions",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver l'email",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun email trouvé pour {artistEmail}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Emails Outlook
          <Badge variant="secondary">{emails.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {emails.map((email) => {
            const isExpanded = expandedEmailId === email.id;
            return (
              <div
                key={email.id}
                className="border rounded-lg p-4 space-y-2"
                data-testid={`email-item-${email.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">
                        {email.subject}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() =>
                          setExpandedEmailId(isExpanded ? null : email.id)
                        }
                        data-testid={`button-toggle-email-${email.id}`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      De: {email.from.emailAddress.name || email.from.emailAddress.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(email.receivedDateTime), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => archiveMutation.mutate(email.id)}
                    disabled={archiveMutation.isPending}
                    data-testid={`button-archive-email-${email.id}`}
                  >
                    {archiveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-1" />
                        Archiver
                      </>
                    )}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {email.bodyPreview}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
