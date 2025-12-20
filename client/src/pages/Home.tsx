import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Mail, FileType, Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  markdown: z.string().min(1, "Please enter some markdown content"),
  target: z.enum(['email', 'docx', 'pdf']),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { toast } = useToast();
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const exportMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/export", data);
      return res.json();
    },
    onSuccess: (data) => {
      setLastResult({ success: true, message: `Job submitted successfully. Job ID: ${data.job_id}` });
      toast({
        title: "Export submitted",
        description: "Your export request has been sent.",
      });
    },
    onError: (error: Error) => {
      setLastResult({ success: false, message: error.message });
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      markdown: "",
      target: "pdf",
    },
  });

  const onSubmit = (data: FormValues) => {
    setLastResult(null);
    exportMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-title">
            8825 Export Portal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Convert Markdown to other formats
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              New Export
            </CardTitle>
            <CardDescription>
              Paste your markdown content and select an export format.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="markdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markdown Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="# Your Markdown Here&#10;&#10;Paste your content..."
                          className="min-h-[300px] font-mono text-sm"
                          data-testid="input-markdown"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Export Target</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-target">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email" data-testid="option-email">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="docx" data-testid="option-docx">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>DOCX</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pdf" data-testid="option-pdf">
                            <div className="flex items-center gap-2">
                              <FileType className="w-4 h-4" />
                              <span>PDF</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={exportMutation.isPending}
                  data-testid="button-submit"
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {lastResult && (
              <div 
                className={`mt-6 p-4 rounded-md flex items-center gap-3 ${
                  lastResult.success 
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" 
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
                data-testid="status-result"
              >
                {lastResult.success ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm">{lastResult.message}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
