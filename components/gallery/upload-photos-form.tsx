"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  photos: z.array(z.instanceof(File)).min(1, "At least one photo is required"),
  captions: z.array(z.string()).optional(),
});

interface UploadPhotosFormProps {
  eventId: string;
  onSuccess: () => void;
}

export function UploadPhotosForm({
  eventId,
  onSuccess,
}: UploadPhotosFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photos: [],
      captions: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // Upload photos in parallel
      const uploadPromises = values.photos.map(async (photo, index) => {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `events/${eventId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(filePath);

        return {
          event_id: eventId,
          url: publicUrl,
          caption: values.captions?.[index] || null,
          uploaded_by: userId,
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);

      // Create photo records
      const { error: photoError } = await supabase
        .from("event_photos")
        .insert(uploadedPhotos);

      if (photoError) throw photoError;

      toast({
        title: "Success",
        description: "Photos have been uploaded successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    form.setValue("photos", files);
    form.setValue("captions", new Array(files.length).fill(""));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="photos"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedFiles.map((file, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`captions.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption for {file.name}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter photo caption (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Photos
          </Button>
        </div>
      </form>
    </Form>
  );
}
