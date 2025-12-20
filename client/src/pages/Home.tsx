import { useState } from "react";
import { useCreateJob, useJob } from "@/hooks/use-jobs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Mail,
  MessageSquare,
  FileCode,
  FileType,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Download,
  Send,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Schema for the form based on API input
const formSchema = z.object({
  markdown: z.string().min(10, "Content must be at least 10 characters"),
  target: z.enum(['email', 'sms', 'docx', 'pdf', 'gdoc']),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const createJob = useCreateJob();
  const { data: job, isLoading: isJobLoading } = useJob(jobId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      markdown: "",
      target: "pdf",
    },
  });

  const onSubmit = (data: FormValues) => {
    createJob.mutate(data, {
      onSuccess: (response) => {
        setJobId(response.job_id);
        toast({
          title: "Export started",
          description: "Your document is being processed...",
        });
      },
      onError: (error) => {
        toast({
          title: "Export failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200";
      case "processing": return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200";
      case "failed": return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200";
      default: return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200";
    }
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case "email": return <Mail className="w-4 h-4" />;
      case "sms": return <MessageSquare className="w-4 h-4" />;
      case "docx": return <FileText className="w-4 h-4" />;
      case "pdf": return <FileType className="w-4 h-4" />;
      case "gdoc": return <FileCode className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-2xl shadow-sm border border-border mb-4">
              <span className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-xl">
                <Sparkles className="w-4 h-4" />
                New v2.0
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
              8825 Export Portal
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your raw markdown into professional documents instantly. 
              Support for PDF, DOCX, and direct messaging channels.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-1">
          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-border shadow-xl shadow-black/5 bg-white overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-border pb-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  New Export Job
                </CardTitle>
                <CardDescription>
                  Paste your markdown content below and choose a destination format.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="markdown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground">Markdown Content</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Textarea 
                                placeholder="# Meeting Notes&#10;&#10;Key takeaways from the session..." 
                                className="min-h-[250px] font-mono text-sm resize-y rounded-xl border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all p-4 leading-relaxed"
                                {...field} 
                              />
                              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                                {field.value.length} chars
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Standard markdown syntax is supported including tables and lists.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col md:flex-row gap-6">
                      <FormField
                        control={form.control}
                        name="target"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-base font-semibold text-foreground">Export Target</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl border-2 hover:border-primary/50 transition-colors">
                                  <SelectValue placeholder="Select output format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pdf" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-red-100 text-red-600"><FileType className="w-4 h-4" /></div>
                                    <span>PDF Document</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="docx" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-blue-100 text-blue-600"><FileText className="w-4 h-4" /></div>
                                    <span>Word Document (DOCX)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="gdoc" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-yellow-100 text-yellow-600"><FileCode className="w-4 h-4" /></div>
                                    <span>Google Doc</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="email" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-purple-100 text-purple-600"><Mail className="w-4 h-4" /></div>
                                    <span>Email Text</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="sms" className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-green-100 text-green-600"><MessageSquare className="w-4 h-4" /></div>
                                    <span>SMS Message</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex-1 flex items-end">
                         <Button 
                          type="submit" 
                          size="lg"
                          disabled={createJob.isPending}
                          className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                        >
                          {createJob.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Start Export
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Status Section */}
          <AnimatePresence>
            {jobId && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                          Export Status
                          {job?.status && (
                            <Badge variant="outline" className={getStatusColor(job.status)}>
                              {job.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {job.status === 'pending' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          ID: {jobId}
                        </p>
                      </div>

                      {job?.status === 'completed' && job.artifactUrl && (
                        <Button 
                          variant="outline"
                          className="w-full md:w-auto bg-white hover:bg-white hover:text-primary hover:border-primary/50 shadow-sm"
                          onClick={() => window.open(job.artifactUrl!, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Artifact
                        </Button>
                      )}

                      {job?.status === 'failed' && (
                        <div className="text-destructive flex items-center gap-2 text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span>Error: {job.error || "Unknown error occurred"}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar Visual */}
                    {(job?.status === 'pending' || job?.status === 'processing') && (
                      <div className="mt-6 space-y-2">
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 10, ease: "linear" }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center animate-pulse">
                          Generating document...
                        </p>
                      </div>
                    )}

                    {job?.status === 'completed' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-800"
                      >
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Success!</p>
                          <p className="text-sm text-green-700">Your file has been generated successfully.</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
